window.onload = () => {
    // CONSTANTES OBTENIDAS DEL DOCUMENTO
    // Secciones
    const seccionCategorias = document.getElementById("container-categorias");
    const seccionProductos = document.getElementById("container-productos");
    const seccionCarrito = document.getElementById("container-carrito");
    const seccionLogin = document.getElementById("container-login");
    const seccionRegistro = document.getElementById("container-registro");
    const seccionSuscripcion = document.getElementById("container-suscripcion");
    const seccionSiguenos = document.getElementById("container-siguenos");

    // Botones
    const botonCarrito = document.getElementById("boton-carrito");
    const botonVaciarCarrito = document.getElementById("vaciar-carrito");
    const botonFinalizarCompra = document.getElementById("finalizar-compra");
    const botonInicio = document.getElementById("boton-inicio");
    const botonLogin = document.getElementById("boton-login");
    const botonRegistro = document.getElementById("boton-registro");
    const botonCategorias = document.getElementById("boton-categorias");
    const botonConectate = document.getElementById("boton-redes");
    const botonSuscripcion = document.getElementById("boton-suscripcion");
    const botonLogout = document.getElementById("boton-logout");
    const flechaInicio = document.getElementById("flecha-inicio");

    // Divs
    const categorias = document.getElementById("categorias");
    const productosDiv = document.getElementById("lista-productos");
    const carritoLista = document.getElementById("carrito-lista");
    const seccionHero = document.getElementById("container-hero");

    // Párrafos
    const mensajeProductos = document.getElementById("mensaje-productos");
    const totalCarrito = document.getElementById("total-carrito");

    // Formularios
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro")

    // VARIABLES PARA LA FUNCIONALIDAD DEL PROGRAMA
    let productoInicial = 0; // Para paginar productos
    let categoriaId = null; // Categoría seleccionada
    let cargando = false; // Control de estado de carga
    let hayMasProductos = true; // Indica si hay más productos por cargar
    let carrito = [];
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Cargar los datos de la sesión actual
    if(sesion){
        botonLogin.style.display = "none";
        botonRegistro.style.display = "none";
        botonLogout.style.display = "block";

        // Encontrar al usuario actual y actualizar su carrito
        let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
        if (usuarioIndex !== -1) {
            sesion.carrito = usuarios[usuarioIndex].carrito;
            carrito = usuarios[usuarioIndex].carrito;
        }
        actualizarCarrito();
    }

    // FUNCIONES
    // Función para cargar y mostrar categorías
    function mostrarCategorias() {
        const url = `https://api.escuelajs.co/api/v1/categories`;

        categorias.innerHTML = ""; // Evitar duplicados

        fetch(url, { method: "GET" })
            .then((res) => res.json())
            .then((json) => {
                json.slice(0, 5).forEach((item) => {
                    const categoria = document.createElement("div");
                    categoria.className = "categoria";

                    // Crear el enlace <a> que envuelve la foto
                    const enlace = document.createElement("a");
                    enlace.setAttribute("href", "#container-productos");

                    // Crear la imagen dentro del enlace
                    const foto = document.createElement("img");
                    foto.setAttribute("src", item.image);
                    foto.onerror = () => {
                        foto.setAttribute("src", "./img/articulo_por_defecto.jpg");
                    };

                    // Asignar el evento al enlace
                    enlace.addEventListener("click", (e) => {
                        e.preventDefault(); 
                        categoriaId = item.id; // Obtener la id de la categoría
                        productoInicial = 0; 
                        productosDiv.innerHTML = "";
                        hayMasProductos = true; 
                        seccionCategorias.style.display = "none"; 
                        seccionSuscripcion.style.display = "none"; 
                        seccionSiguenos.style.display = "none";
                        seccionProductos.style.display = "grid"; 
                        cargarProductos(); 
                    });

                    // Añadir la imagen al enlace
                    enlace.appendChild(foto);

                    // Crear el nombre de la categoría
                    const nombre = document.createElement("p");
                    nombre.innerHTML = item.name.toUpperCase();

                    // Añadir el enlace y el nombre al contenedor de la categoría
                    categoria.appendChild(enlace);
                    categoria.appendChild(nombre);

                    // Añadir la categoría al contenedor principal
                    categorias.appendChild(categoria);
                });
            })
            .catch((error) => {
                console.error("Error al obtener las categorías:", error);
                categorias.innerHTML = "<p>Error al cargar las categorías. Intenta nuevamente más tarde.</p>";
            });
    }

    // Función para cargar productos
    function cargarProductos() {
        const contenedor = document.getElementById("carga-contenedor");
        contenedor.style.visibility = "visible";

        if (cargando || !categoriaId || !hayMasProductos) {
            contenedor.style.visibility = "hidden";
            return;
        }

        cargando = true;

        const url = `https://api.escuelajs.co/api/v1/categories/${categoriaId}/products?offset=${productoInicial * 10}&limit=10`;

        fetch(url, { method: "GET" })
            .then((res) => res.json())
            .then((productos) => {
                if (productos.length === 0 && productoInicial === 0) {
                    // Mostrar mensaje si no hay productos al inicio
                    mensajeProductos.style.display = "block";
                    hayMasProductos = false; // Detener más cargas
                } else if (productos.length === 0) {
                    // Si no hay más productos en scroll infinito, detener cargas
                    mensajeProductos.style.display = "none";
                    hayMasProductos = false;
                } else {
                    mensajeProductos.style.display = "none";
                    productos.forEach((producto) => {
                        const productoDiv = document.createElement("div");
                        productoDiv.className = "producto";

                        const img = document.createElement("img");
                        img.setAttribute("src", producto.images[0] || "./img/articulo_por_defecto.jpg");
                        img.onerror = () => {
                            img.setAttribute("src", "./img/articulo_por_defecto.jpg");
                        };

                        img.addEventListener("click", () => {
                            mostrarProducto(producto);
                        });


                        const nombre = document.createElement("p");
                        nombre.innerHTML = producto.title;

                        const precio = document.createElement("p");
                        precio.innerHTML = `$${producto.price}`;
   
                        productoDiv.appendChild(img);
                        productoDiv.appendChild(nombre);
                        productoDiv.appendChild(precio);

                        if(sesion !== null){
                            const agregarCesta = document.createElement("button");
                            agregarCesta.innerHTML = "Añadir al carrito";
                            agregarCesta.classList.add("agregarCesta");
                            agregarCesta.addEventListener("click", () => agregarAlCarrito(producto));
                            productoDiv.appendChild(agregarCesta);
                        }

                        productosDiv.appendChild(productoDiv);
                    });

                    productoInicial++; // Incrementar página solo si hubo productos
                }
            })
            .catch((error) => {
                contenedor.style.visibility = "hidden";
                console.error("Error al cargar los productos:", error);
                productosDiv.innerHTML = "<p>Error al cargar los productos. Intenta nuevamente más tarde.</p>";
            })
            .finally(() => {
                cargando = false;
                contenedor.style.visibility = "hidden"; // Ocultar el preload
            });
    }

    // Función para agregar productos al carrito
    function agregarAlCarrito(producto) {
        if (!sesion) {
            avisoEnPantalla("Por favor, inicia sesión para agregar productos al carrito.");
            return;
        }
    
        const productoEnCarrito = sesion.carrito.find(item => item.id === producto.id);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            sesion.carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem("sesion", JSON.stringify(sesion));

        // Encontrar al usuario actual y actualizar su carrito
        let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].carrito = sesion.carrito;
        }
        // Guardar el array de usuarios actualizado en localStorage
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
        carrito = sesion.carrito;
        avisoEnPantalla("Producto añadido al carrito");
        actualizarCarrito();
    }

    // Función para actualizar la visualización del carrito
    function actualizarCarrito() {
        carritoLista.innerHTML = "";
        let total = 0;

        carrito.forEach((producto) => {
            const productoDiv = document.createElement("div");
            productoDiv.className = "producto-carrito";

            const nombre = document.createElement("p");
            nombre.innerHTML = producto.title;

            const cantidad = document.createElement("input");
            cantidad.type = "number";
            cantidad.value = producto.cantidad;
            cantidad.min = 1;
            cantidad.addEventListener("input", () => {
                producto.cantidad = parseInt(cantidad.value) || 1;
                sesion.carrito = carrito;
                localStorage.setItem("sesion", JSON.stringify(sesion));

                // Encontrar al usuario actual y actualizar su carrito
                let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
                if (usuarioIndex !== -1) {
                    usuarios[usuarioIndex].carrito = carrito;
                }
                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                actualizarCarrito();
            });

            const precio = document.createElement("p");
            precio.innerHTML = `$${(producto.price * producto.cantidad).toFixed(2)}`;

            const eliminar = document.createElement("button");
            eliminar.innerHTML = `<i class="fa-solid fa-dumpster fa-lg"></i>`;
            eliminar.addEventListener("click", () => {
                carrito = carrito.filter(item => item.id !== producto.id);
                sesion.carrito = sesion.carrito.filter(item => item.id !== producto.id);
                localStorage.setItem("sesion", JSON.stringify(sesion));

                // Encontrar al usuario actual y actualizar su carrito
                let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
                if (usuarioIndex !== -1) {
                    usuarios[usuarioIndex].carrito = sesion.carrito;
                }
                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                actualizarCarrito();
            });

            productoDiv.appendChild(nombre);
            productoDiv.appendChild(cantidad);
            productoDiv.appendChild(precio);
            productoDiv.appendChild(eliminar);

            carritoLista.appendChild(productoDiv);

            total += producto.price * producto.cantidad;
        });

        totalCarrito.innerHTML = `Total: $${total.toFixed(2)}`;
        botonCarrito.innerHTML = `<i class="fa-solid fa-cart-shopping fa-2xl"></i> (${carrito.length})`; // Actualizar contador del carrito
    }

    // Función para mostrar los detalles del producto
    function mostrarProducto(e) {
        const carga = document.getElementById("carga-contenedor");
        carga.style.visibility = "visible";

        // Crear los elementos
        const contenedor = document.createElement("div");
        contenedor.className = "contenedor";

        const detalles = document.createElement("div");
        detalles.className = "detalles";

        const botonCerrar = document.createElement("button");
        botonCerrar.className = "cerrar";
        botonCerrar.innerHTML = "x";
        botonCerrar.addEventListener("click", () => {
            document.body.removeChild(contenedor);
            document.body.style.overflow = "auto";
        });

        detalles.innerHTML = `
            <h2>${e.title} (Id Ref: ${e.id})</h2>
            <p><strong>Descripción:</strong> ${e.description}</p>
            <p><strong>Categoria:</strong> ${e.category['name']}</p>
            <p><strong>Precio:</strong> ${e.price}</p>`;

        detalles.appendChild(botonCerrar);
        contenedor.appendChild(detalles);

        if(sesion != null){
            const botonAgregar = document.createElement("button");
            botonAgregar.className = "botonAgregar";
            botonAgregar.innerHTML = "Añadir al carrito";
            botonAgregar.addEventListener("click", () => agregarAlCarrito(e));
            detalles.appendChild(botonAgregar);
        }

        carga.style.visibility = "hidden";
        document.body.appendChild(contenedor);
        document.body.style.overflow = "hidden";     
    }

    // Función para regitrar a un usuario
    async function registrarUsuario(nombre, email, contraseña) {
        const url = "https://api.escuelajs.co/api/v1/users/";
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nombre,
                    email: email,
                    password: contraseña,
                    avatar: "https://picsum.photos/800",
                }),
            });
    
            if (!response.ok) {
                avisoEnPantalla("Error al registrar usuario.");
            } else {                
                // Guardar el usuario en el array de usuarios local
                usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                
                // Verificar si ya existe un usuario con ese correo
                if (usuarios.some((usuario) => usuario.email === email)) {
                    avisoEnPantalla("El correo ya está registrado localmente. Intenta iniciar sesión.");
                    return;
                }
    
                // Agregar el nuevo usuario al array local
                usuarios.push({
                    nombre: nombre,
                    email: email,
                    password: contraseña,
                    carrito: [],
                });
    
                // Guardar el array actualizado en el localStorage
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
                avisoEnPantalla("Usuario registrado con éxito");
                mandarCorreoRegistro(); // Enviar correo de confirmación
                landingPage(); // Redirigir al landing page
            }
        } catch (error) {
            avisoEnPantalla("Error de conexión al registrar usuario. Intenta nuevamente.");
            console.error(error);
        }
    }

    // Función para iniciar sesión
    async function iniciarSesion(email, contrasena) {
        const url = "https://api.escuelajs.co/api/v1/users/";
    
        try {
            // Obtener el array de usuarios locales desde el localStorage
            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    
            // Buscar el usuario localmente
            let usuarioEncontrado = usuarios.find((usuario) => usuario.email === email);
    
            if (!usuarioEncontrado) {
                // Si no está localmente, consultar la API para obtener los usuarios
                const response = await fetch(url);
    
                if (!response.ok) {
                    avisoEnPantalla("Error al buscar usuarios. Intenta de nuevo.");
                    return;
                }
    
                const usuariosAPI = await response.json();
                usuarioEncontrado = usuariosAPI.find((usuario) => usuario.email === email);
    
                // Si no se encuentra en la API tampoco, mostrar un mensaje
                if (!usuarioEncontrado) {
                    avisoEnPantalla("Correo no registrado. Por favor, regístrate.");
                    return;
                }
    
                // Guardar el usuario obtenido de la API en el array local
                usuarios.push({
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.name,
                    email: usuarioEncontrado.email,
                    password: contrasena, // Usar la contraseña proporcionada para sincronización inicial
                    avatar: usuarioEncontrado.avatar,
                    carrito: [],
                });
    
                // Actualizar el array de usuarios en el localStorage
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }
    
            // Validar la contraseña del usuario encontrado
            if (usuarioEncontrado.password !== contrasena) {
                avisoEnPantalla("Contraseña incorrecta. Intenta de nuevo.");
            } else {
                // Almacenar datos de la sesión
                sesion = { nombre: usuarioEncontrado.nombre, correo: email, carrito: usuarioEncontrado.carrito || [] };
                localStorage.setItem("sesion", JSON.stringify(sesion));
    
                // Actualizar botones de sesión
                botonLogin.style.display = "none";
                botonRegistro.style.display = "none";
                botonLogout.style.display = "block";

                // Actualizar el carrito
                let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
                if (usuarioIndex !== -1) {
                    carrito = usuarios[usuarioIndex].carrito;
                }
    
                // Ir a la página principal
                actualizarCarrito();
                avisoEnPantalla("Sesión iniciada correctamente");
                landingPage();
            }
        } catch (error) {
            avisoEnPantalla("Ocurrió un error al iniciar sesión. Intenta nuevamente.");
            console.error(error);
        }
    }

    // Función para mandar correo al registrarse
    function mandarCorreoRegistro() {
        let parametros = {
            nombre: document.getElementById("nombre-registro").value,
            email: document.getElementById("email-registro").value
        }

        if (!parametros.nombre || !parametros.email) {
            avisoEnPantalla("Por favor, completa todos los campos.");
            return;
        }

        emailjs.send("service_lj8ddtz", "template_jddi90n", parametros)
            .then(() => {
                avisoEnPantalla("¡Email enviado con éxito!");
            })
            .catch((error) => {
                console.error("Error al enviar el correo:", error); 
                avisoEnPantalla("Hubo un problema al enviar el correo. Por favor, intenta nuevamente.");
            });
    }

    // Función para mandar correo al hacer un pedido
    function mandarCorreoPedido() {
        if (!sesion || sesion.carrito.length === 0) {
            avisoEnPantalla("El carrito está vacío o no has iniciado sesión.");
            return;
        }
    
        let parametros = {
            nombre: sesion.nombre,
            email: sesion.correo,
            pedido: sesion.carrito.map(producto => `${producto.title} (Cantidad: ${producto.cantidad})`).join(", ")
        };
    
        emailjs.send("service_lj8ddtz", "template_f1gs39e", parametros)
            .then(() => {
                avisoEnPantalla("¡Email enviado con éxito!");
            })
            .catch((error) => {
                console.error("Error al enviar el correo:", error);
                avisoEnPantalla("Hubo un problema al enviar el correo. Por favor, intenta nuevamente.");
            });
    }

    // Función para mostrar la landing page completa
    function landingPage() {
        seccionProductos.style.display = "none";
        seccionCarrito.style.display = "none";
        seccionLogin.style.display = "none";
        seccionRegistro.style.display = "none";
        seccionHero.style.display = "flex";
        seccionCategorias.style.display = "grid";
        seccionSiguenos.style.display = "flex";
        seccionSuscripcion.style.display = "flex";
    }

    // Función para la notificacion;
    function avisoEnPantalla(mensaje) {
        // Crear un nuevo elemento de notificación
        const notificacion = document.createElement("div");
        notificacion.classList.add("notificacion");
        notificacion.textContent = mensaje;
    
        // Añadir al contenedor de notificaciones
        const contenedor = document.getElementById("notificaciones-container");
        contenedor.appendChild(notificacion);
    
        // Mostrar la notificación
        setTimeout(() => {
            notificacion.classList.add("show");
        }, 10); 
    
        // Ocultar y eliminar la notificación después de 3 segundos
        setTimeout(() => {
            notificacion.classList.add("fade-out");
            setTimeout(() => {
                contenedor.removeChild(notificacion);
            }, 500); 
        }, 3000);
    }    

    // EVENTOS
    // Evento para vaciar el carrito
    botonVaciarCarrito.addEventListener("click", () => {
        carrito = [];
        sesion.carrito = [];

        // Encontrar al usuario actual y actualizar su carrito
        let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].carrito = [];
        }
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        localStorage.setItem("sesion", JSON.stringify(sesion));
        actualizarCarrito();
    });

    // Evento para finalizar la compra
    botonFinalizarCompra.addEventListener("click", () => {
        if (carrito.length == 0) avisoEnPantalla("El carrito está vacío");
        else {
            mandarCorreoPedido();
            avisoEnPantalla("¡Gracias por tu compra!");
            carrito = [];
            sesion.carrito = [];
            // Encontrar al usuario actual y actualizar su carrito
            let usuarioIndex = usuarios.findIndex(usuario => usuario.email === sesion.correo);
            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex].carrito = [];
            }
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            localStorage.setItem("sesion", JSON.stringify(sesion));
            actualizarCarrito();
        }
    });

    // Evento para mostrar el carrito
    botonCarrito.addEventListener("click", () => {
        seccionProductos.style.display = "none";
        seccionCategorias.style.display = "none";
        seccionLogin.style.display = "none";
        seccionRegistro.style.display = "none";
        seccionHero.style.display = "none";
        seccionSuscripcion.style.display = "none";
        seccionSiguenos.style.display = "none";
        seccionCarrito.style.display = "block";
    });
 
    // Eventos para regresar a la landing page 
    botonInicio.addEventListener("click", landingPage);
    botonCategorias.addEventListener("click", landingPage);
    botonConectate.addEventListener("click", landingPage);
    botonSuscripcion.addEventListener("click", landingPage);

    // Evento para mostrar el inicio de sesión
    botonLogin.addEventListener("click", () => {
        seccionProductos.style.display = "none";
        seccionCarrito.style.display = "none";
        seccionCategorias.style.display = "none";
        seccionRegistro.style.display = "none";
        seccionHero.style.display = "none";
        seccionSuscripcion.style.display = "none";
        seccionSiguenos.style.display = "none";
        seccionLogin.style.display = "flex";
    });

    // Evento para mostrar el registro
    botonRegistro.addEventListener("click", () => {
        seccionProductos.style.display = "none";
        seccionCarrito.style.display = "none";
        seccionLogin.style.display = "none";
        seccionCategorias.style.display = "none";
        seccionHero.style.display = "none";
        seccionSuscripcion.style.display = "none";
        seccionSiguenos.style.display = "none";
        seccionRegistro.style.display = "flex";
    });

    // Evento para realizar el logout
    botonLogout.addEventListener("click", () => {
        botonLogin.style.display = "block";
        botonRegistro.style.display = "block";
        botonLogout.style.display = "none";
        sesion = null;
        carrito = [];
        localStorage.removeItem("sesion");
        avisoEnPantalla("Sesión cerrada");
        actualizarCarrito();
        landingPage();
    });

    // Evento parra enviar el formulario
    formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre-registro").value;
        const email = document.getElementById("email-registro").value;
        const password = document.getElementById("password-registro").value;

        registrarUsuario(nombre, email, password);
    });

    // Evento para enviar el correo al registrarse
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        iniciarSesion(email, password);
    });

    // Evento para Scroll Infinito
    window.addEventListener("scroll", () => {
        const finalPagina =
            window.innerHeight + document.documentElement.scrollTop >=
            document.body.offsetHeight * 0.7;

        if (finalPagina) {
            cargarProductos();
        }
    });

    // Evento para realizar el scroll desde la sección Hero
    flechaInicio.addEventListener("click", function (e) {
        e.preventDefault(); // Evita el comportamiento por defecto del enlace

        // Encuentra las secciones visibles
        const secciones = [seccionCategorias, seccionProductos];
        const siguienteSeccion = secciones.find(
            (seccion) =>
                getComputedStyle(seccion).display !== "none" &&
                seccion.id !== "container-hero"
        );

        if (siguienteSeccion) {
            siguienteSeccion.scrollIntoView({
                block: "start",
            });
        } else {
            console.log("No hay más secciones visibles para redirigir.");
        }
    });

    // Inicializar la aplicación
    mostrarCategorias();
};
