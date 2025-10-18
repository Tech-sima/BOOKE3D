(function(){
	if(typeof THREE === 'undefined'){ return; }

	const container = document.getElementById('map-container');
	if(!container){ return; }

	let scene, camera, renderer;
	let isDragging = false;
	const lastPos = { x: 0, y: 0 };
	// Статичный зум (чем больше, тем ближе). Пользователь менять не может
	const STATIC_ZOOM = 1.2;

	init();
	loadCity();
	animate();

	function init(){
		scene = new THREE.Scene();
		scene.background = null; // Убираем серый фон

		const aspect = container.clientWidth / container.clientHeight;
		camera = new THREE.OrthographicCamera(-10*aspect, 10*aspect, 10, -10, 0.1, 1000);
		setIsometricCamera(3.5);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setClearColor(0x000000, 0); // Прозрачный фон
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.shadowMap.enabled = true;
		renderer.domElement.id = 'three-canvas';
		container.prepend(renderer.domElement);

		scene.add(new THREE.AmbientLight(0xffffff, 0.9));
		const dir = new THREE.DirectionalLight(0xffffff, 0.6);
		dir.position.set(10, 20, 10);
		scene.add(dir);

		window.addEventListener('resize', onResize);
		bindGestures();
	}

	function setIsometricCamera(distance){
		// Повернем камеру на противоположную сторону (45° + 180°)
		const angle = Math.PI/4 + Math.PI; // 225°
		const heightFactor = 0.5; // еще больше уменьшаем высоту камеры
		const x = Math.cos(angle) * distance;
		const z = Math.sin(angle) * distance;
		const y = distance * heightFactor;
		camera.position.set(x,y,z);
		camera.lookAt(0,0,0);
	}

	function loadCity(){
		if(!THREE.GLTFLoader){ return; }
		const loader = new THREE.GLTFLoader();
		loader.load('models/main-city.glb', (gltf)=>{
			const root = gltf.scene || gltf.scenes && gltf.scenes[0];
			if(!root){ return; }
			root.traverse((obj)=>{
				if(obj.isMesh){ obj.receiveShadow = true; }
			});
			// Центруем модель и поднимаем, чтобы заполнить весь экран
			const box = new THREE.Box3().setFromObject(root);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			root.position.sub(center);
			root.position.y += size.y * 0.2; // небольшой подъем для лучшего позиционирования
			scene.add(root);
			// Пересчитываем границы после сдвига и подгоняем фрустум
			const adjustedBox = new THREE.Box3().setFromObject(root);
			fitFrustumToBounds(adjustedBox);
		});
	}

	function fitFrustumToBounds(bounds){
		const size = bounds.getSize(new THREE.Vector3());
		const aspect = container.clientWidth / container.clientHeight;
		
		// Определяем, мобильное ли устройство
		const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
		
		if (isMobile) {
			// Для мобильных - просто растягиваем на весь экран
			const frustumHeight = 20; // фиксированная высота для мобильных
			const frustumWidth = frustumHeight * aspect;
			
			camera.top = frustumHeight/2;
			camera.bottom = -frustumHeight/2;
			camera.left = -frustumWidth/2;
			camera.right = frustumWidth/2;
		} else {
			// Для десктопа - обычная логика
			const modelWidth = size.x;
			const modelHeight = size.z;
			const modelAspect = modelWidth / modelHeight;
			
			let frustumWidth, frustumHeight;
			
			if (modelAspect > aspect) {
				frustumHeight = modelHeight / STATIC_ZOOM;
				frustumWidth = frustumHeight * aspect;
			} else {
				frustumWidth = modelWidth / STATIC_ZOOM;
				frustumHeight = frustumWidth / aspect;
			}
			
			camera.top = frustumHeight/2;
			camera.bottom = -frustumHeight/2;
			camera.left = -frustumWidth/2;
			camera.right = frustumWidth/2;
		}
		
		camera.updateProjectionMatrix();
	}

	function onResize(){
		const aspect = container.clientWidth / container.clientHeight;
		const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
		
		if (isMobile) {
			// Для мобильных - просто растягиваем на весь экран
			const frustumHeight = 20;
			const frustumWidth = frustumHeight * aspect;
			
			camera.top = frustumHeight/2;
			camera.bottom = -frustumHeight/2;
			camera.left = -frustumWidth/2;
			camera.right = frustumWidth/2;
		} else {
			// Для десктопа - пересчитываем пропорционально
			const currentHeight = camera.top - camera.bottom;
			const newWidth = currentHeight * aspect;
			camera.left = -newWidth / 2;
			camera.right = newWidth / 2;
		}
		
		camera.updateProjectionMatrix();
		renderer.setSize(container.clientWidth, container.clientHeight);
	}

	function bindGestures(){
		container.addEventListener('pointerdown', (e)=>{ isDragging = true; lastPos.x=e.clientX; lastPos.y=e.clientY; });
		window.addEventListener('pointerup', ()=>{ isDragging = false; });
		window.addEventListener('pointermove', (e)=>{
			if(!isDragging) return;
			const dx = (e.clientX - lastPos.x) * 0.02;
			const dy = (e.clientY - lastPos.y) * 0.02;
			lastPos.x = e.clientX; lastPos.y = e.clientY;
			// Панорамирование в плоскости XZ
			const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).setY(0).normalize();
			const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).setY(0).normalize();
			camera.position.addScaledVector(right, -dx);
			camera.position.addScaledVector(forward, dy);
			camera.updateMatrixWorld();
		});
		// Отключаем пользовательский зум колесом/пинчем: карта всегда в фиксированном масштабе
	}

	function animate(){
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
})();


