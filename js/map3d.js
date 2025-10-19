(function(){
	if(typeof THREE === 'undefined'){ return; }

	const container = document.getElementById('map-container');
	if(!container){ return; }

	let scene, camera, renderer;
	let isDragging = false;
	const lastPos = { x: 0, y: 0 };
	// Статичный зум (чем больше, тем ближе). Пользователь менять не может
	const STATIC_ZOOM = 2.0;

	init();
	loadCity();
	animate();

	function init(){
		scene = new THREE.Scene();
		scene.background = null; // Убираем серый фон

		const aspect = container.clientWidth / container.clientHeight;
		camera = new THREE.OrthographicCamera(-10*aspect, 10*aspect, 10, -10, 0.1, 1000);
		setFrontCamera(3.5);

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

	function setFrontCamera(distance){
		// Камера над городом - смотрит сверху вниз под углом сбоку
		const x = -distance * 0.3; // смещение влево по X
		const y = distance; // над городом по Y
		const z = -distance * 0.8; // опускаем камеру еще ниже по Z
		camera.position.set(x,y,z);
		camera.lookAt(0,0,0);
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
			// Центруем модель для фронтального вида
			const box = new THREE.Box3().setFromObject(root);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			root.position.sub(center);
			// Для фронтального вида не поднимаем модель, оставляем по центру
			scene.add(root);
			// Пересчитываем границы после сдвига и подгоняем фрустум
			const adjustedBox = new THREE.Box3().setFromObject(root);
			fitFrustumToBounds(adjustedBox);
		});
	}

	function fitFrustumToBounds(bounds){
		const size = bounds.getSize(new THREE.Vector3());
		const aspect = container.clientWidth / container.clientHeight;
		
		// Для вида сверху обрезаем края, чтобы заполнить весь экран
		// Используем размеры модели по X и Z для определения нужного фрустума
		const modelWidth = size.x;
		const modelHeight = size.z; // для вида сверху используем Z как высоту
		
		// Определяем, какой размер больше - ширина или высота модели
		const modelAspect = modelWidth / modelHeight;
		
		let frustumWidth, frustumHeight;
		
		if (modelAspect > aspect) {
			// Модель шире экрана - обрезаем по бокам
			frustumHeight = modelHeight / STATIC_ZOOM;
			frustumWidth = frustumHeight * aspect;
		} else {
			// Модель выше экрана - обрезаем сверху и снизу
			frustumWidth = modelWidth / STATIC_ZOOM;
			frustumHeight = frustumWidth / aspect;
		}
		
		camera.top = frustumHeight/2;
		camera.bottom = -frustumHeight/2;
		camera.left = -frustumWidth/2;
		camera.right = frustumWidth/2;
		camera.updateProjectionMatrix();
	}

	function onResize(){
		const aspect = container.clientWidth / container.clientHeight;
		const currentHeight = camera.top - camera.bottom;
		const currentWidth = camera.right - camera.left;
		
		// Пересчитываем фрустум с учетом нового соотношения сторон
		if (currentWidth / currentHeight > aspect) {
			// Экран стал уже - обрезаем по бокам
			const newHeight = currentHeight;
			const newWidth = newHeight * aspect;
			camera.top = newHeight / 2;
			camera.bottom = -newHeight / 2;
			camera.left = -newWidth / 2;
			camera.right = newWidth / 2;
		} else {
			// Экран стал шире - обрезаем сверху и снизу
			const newWidth = currentWidth;
			const newHeight = newWidth / aspect;
			camera.left = -newWidth / 2;
			camera.right = newWidth / 2;
			camera.top = newHeight / 2;
			camera.bottom = -newHeight / 2;
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


