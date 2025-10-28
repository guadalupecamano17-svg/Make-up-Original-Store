document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // LÓGICA DEL MODO OSCURO (PERSISTENTE EN TODAS LAS PÁGINAS)
    // ==============================================

    // Selecciona el *único* interruptor en el header
    const interruptorModo = document.querySelector('.modo-interruptor');
    const iconoModo = interruptorModo ? interruptorModo.querySelector('i') : null;
    const cuerpo = document.body;
    
    // Solo ejecuta la lógica si el interruptor existe en la página actual
    if (interruptorModo) {

        /**
         * Actualiza la clase 'modo-oscuro' en el body y el icono del único interruptor.
         * @param {boolean} esOscuro - Si el modo actual debe ser oscuro.
         */
        function actualizarUIModo(esOscuro) {
            if (esOscuro) {
                cuerpo.classList.add('modo-oscuro');
                if (iconoModo) {
                    iconoModo.classList.remove('fa-sun');
                    iconoModo.classList.add('fa-moon');
                }
            } else {
                cuerpo.classList.remove('modo-oscuro');
                if (iconoModo) {
                    iconoModo.classList.remove('fa-moon');
                    iconoModo.classList.add('fa-sun');
                }
            }
        }

        // 1. Cargar la preferencia del usuario al iniciar (PERSISTENCIA)
        function cargarPreferenciaModo() {
            // Revisa lo que está guardado en el navegador
            const modoGuardado = localStorage.getItem('modo-color');
            const esOscuro = modoGuardado === 'oscuro';
            actualizarUIModo(esOscuro);
        }

        // 2. Función para alternar el modo y guardar la preferencia
        function alternarModo() {
            const esOscuroActual = cuerpo.classList.contains('modo-oscuro');
            const esOscuroNuevo = !esOscuroActual;

            if (esOscuroNuevo) {
                localStorage.setItem('modo-color', 'oscuro'); // Guarda el estado 'oscuro'
            } else {
                localStorage.setItem('modo-color', 'claro');  // Guarda el estado 'claro'
            }

            // Aplicar los cambios
            actualizarUIModo(esOscuroNuevo);
        }

        // 3. Agregar el evento de clic al único interruptor
        interruptorModo.addEventListener('click', alternarModo);

        // 4. Ejecutar la función de carga al iniciar
        cargarPreferenciaModo();
    }


    // ==============================================
    // RESTO DE LA LÓGICA DEL CARRITO (EXISTENTE)
    // ==============================================
    
    // 1. Obtención de elementos del DOM
    const carritoIcon = document.getElementById('carrito-icon');
    const contadorCarrito = document.getElementById('contador-carrito');
    const carritoModal = document.getElementById('carrito-modal');
    const cerrarModal = document.getElementById('cerrar-modal');
    const itemsCarritoContainer = document.getElementById('items-carrito');
    const carritoTotalDisplay = document.getElementById('carrito-total');
    const carritoVacioMensaje = document.getElementById('carrito-vacio-mensaje');
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');

    // 2. Inicialización del Carrito (Usando localStorage para persistencia)
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 3. Funciones del Carrito

    /**
     * Abre y cierra el modal del carrito.
     */
    const toggleModal = () => {
        carritoModal.classList.toggle('visible');
    };

    /**
     * Agrega un producto al carrito o incrementa su cantidad.
     * @param {Object} producto - Objeto con id, nombre y precio.
     */
    const agregarProducto = (producto) => {
        const existe = carrito.find(item => item.id === producto.id);

        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        
        // Aplicar efecto Jiggle al ícono del carrito
        carritoIcon.classList.add('jiggle');
        // Aumentar el tiempo a 800ms para que la animación de 0.6s se complete suavemente
        setTimeout(() => {
            carritoIcon.classList.remove('jiggle');
        }, 800); 

        actualizarCarrito();
    };

    /**
     * Remueve un producto del carrito o disminuye su cantidad.
     * @param {number} id - ID del producto a modificar.
     * @param {string} accion - 'sumar', 'restar', o 'eliminar'.
     */
    const modificarCantidad = (id, accion) => {
        const itemIndex = carrito.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            const item = carrito[itemIndex];
            
            if (accion === 'restar') {
                item.cantidad--;
            } else if (accion === 'sumar') {
                item.cantidad++;
            } else if (accion === 'eliminar') {
                item.cantidad = 0;
            }
            
            // Eliminar si la cantidad llega a 0
            if (item.cantidad <= 0) {
                carrito.splice(itemIndex, 1);
            }
            
            actualizarCarrito();
        }
    };

    /**
     * Renderiza los productos en el modal y actualiza el contador/total.
     */
    const actualizarCarrito = () => {
        // Limpiar contenedor y calcular total
        itemsCarritoContainer.innerHTML = '';
        let total = 0;
        let cantidadTotal = 0;

        if (carrito.length === 0) {
            carritoVacioMensaje.style.display = 'block';
            // Asegura que el mensaje se muestre si el contenedor está vacío
            if (!document.getElementById('carrito-vacio-mensaje')) {
                 itemsCarritoContainer.appendChild(carritoVacioMensaje);
            }
        } else {
            carritoVacioMensaje.style.display = 'none';
            
            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                cantidadTotal += item.cantidad;

                // Crear elemento del producto
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-carrito');
                itemDiv.innerHTML = `
                    <p class="item-nombre">${item.nombre}</p>
                    <p class="item-precio">$${item.precio.toLocaleString('es-CL')}</p>
                    <div class="controles-cantidad">
                        <button class="btn-restar" data-id="${item.id}">-</button>
                        <span class="item-cantidad">${item.cantidad}</span>
                        <button class="btn-sumar" data-id="${item.id}">+</button>
                    </div>
                    <p class="item-subtotal">Subtotal: $${subtotal.toLocaleString('es-CL')}</p>
                    <button class="btn-eliminar" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                itemsCarritoContainer.appendChild(itemDiv);
            });
        }
        
        // Actualizar el contador del ícono y el total
        contadorCarrito.textContent = cantidadTotal;
        carritoTotalDisplay.textContent = total.toLocaleString('es-CL');
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Asignar listeners a los nuevos botones de control
        asignarListenersControles();
    };

    /**
     * Asigna los event listeners a los botones de sumar, restar y eliminar dentro del modal.
     */
    const asignarListenersControles = () => {
        document.querySelectorAll('.btn-sumar').forEach(button => {
            button.onclick = (e) => modificarCantidad(parseInt(e.currentTarget.dataset.id), 'sumar');
        });

        document.querySelectorAll('.btn-restar').forEach(button => {
            button.onclick = (e) => modificarCantidad(parseInt(e.currentTarget.dataset.id), 'restar');
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.onclick = (e) => modificarCantidad(parseInt(e.currentTarget.dataset.id), 'eliminar');
        });
    };
    
    // 4. Asignación de Eventos
    
    // Evento para abrir el modal
    if (carritoIcon) carritoIcon.addEventListener('click', toggleModal);

    // Evento para cerrar el modal
    if (cerrarModal) cerrarModal.addEventListener('click', toggleModal);
    
    // Cerrar el modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === carritoModal) {
            toggleModal();
        }
    });

    // Eventos para agregar productos desde las tarjetas
    botonesAgregar.forEach(button => {
        button.addEventListener('click', (e) => {
            const producto = {
                id: parseInt(e.currentTarget.dataset.id),
                nombre: e.currentTarget.dataset.nombre,
                precio: parseInt(e.currentTarget.dataset.precio)
            };
            agregarProducto(producto);
        });
    });

    // Evento para simular la finalización de la compra
    const finalizarCompra = document.getElementById('finalizar-compra');
    if (finalizarCompra) {
        finalizarCompra.addEventListener('click', () => {
            if (carrito.length > 0) {
                alert("¡Compra finalizada con éxito! Total: $" + carritoTotalDisplay.textContent);
                carrito = []; // Vaciar el carrito
                toggleModal();
                actualizarCarrito();
            } else {
                alert("Tu carrito está vacío.");
            }
        });
    }
    
    // Lógica para que las tarjetas de producto aparezcan al hacer scroll (Solo en index.html)
    const cards = document.querySelectorAll('.card');

    if (cards.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, {
            root: null, 
            threshold: 0.1 
        });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Cargar el estado inicial del carrito al cargar la página
    actualizarCarrito();
});