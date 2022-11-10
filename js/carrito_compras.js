const cards = document.getElementById('cards');
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card')
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {};

// Se ordena que el objeto Window espera a la ejecucion de JS
document.addEventListener('DOMContentLoaded', () =>{
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
        
    }
})

cards.addEventListener('click', e => {
    addCarrito(e)
})

items.addEventListener('click', e => {
    btnAccion(e)
})

// El JS espera a la lecura del archivo Json
let fetchData = async ()=>{
    try{
        const res = await fetch('./json/api.json');// el archivo Json es llamado dede el index
        const data = await res.json()
        //console.log(data)
        pintarCards(data)
        
    } catch (error) {
        console.log(error)
    }
    
}
// Formacion de las celdas de ventas

const pintarCards = data => {
    data.forEach(producto => {
        const row = document.createElement('div')
        row.classList.add("card","col-3");
        row.innerHTML +=`
            <div class="card mb-3">
                <div class="card-body">
                    <img src="./img/t${producto.id}.png" alt="${producto.title}" class="card-img-top">
                    <h5>${producto.title}</h5>
                    <p>${producto.precio}</p>
                    <p class="stock">Total en stock: <span>${producto.stock}</span> unidades</p>
                    <button class="btn btn-dark" data-id="${producto.id}">Comprar</button>
                </div>
            </div>`;

        cards.appendChild(row); // Se utiliza una memoria volatil
        
    });
    
}


// Generacion del carrito
const addCarrito = e =>{
    if (e.target.classList.contains('btn-dark')){
        setCarrito(e.target.parentElement)
        //console.log(e.target.parentElement)
    }
    e.stopPropagation()// Evita la activacion de cualquier comando aleatorio
}


const setCarrito = objeto => {
    const producto = {// Forma los campos del carrito
        id: objeto.querySelector('.btn-dark').dataset.id,
        stock:objeto.querySelector('span').textContent,
        prod:objeto.querySelector('img').getAttribute('src'),
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1// Se agrega el valor de defecto en la primera compra del producto
        
    }

    if (carrito.hasOwnProperty(producto.id)){// Incrementa la cantidad en compras repetidas
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = {...producto}// Incrementa los objeto al array por cada compra
    pintarCarrito()
    //console.log("XXX--->",objeto.querySelector('img').getAttribute('src'))
    
}

const pintarCarrito = () =>{ // Genera un array de objetos con el contenido del carrito
    items.innerHTML = ''
    Object.values(carrito).forEach(producto => { // Se recorre cada objeto del array para generar las variables
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelector('img').setAttribute('src', producto.prod)
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    
    items.appendChild(fragment)

    pintarFooter()

    localStorage.setItem('carrito', JSON.stringify(carrito))
}
// Construccion del footer del carrito
const pintarFooter = () => {
    footer.innerHTML = ''
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = 
        `<th scope="row" colspan="5">Carrito vacío - comience a comprar</th>` 
        return      
    }
    const nCantidad = Object.values(carrito).reduce((acc,{cantidad}) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad, precio}) => acc + cantidad * precio, 0)
    
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad// Cantidad total
    templateFooter.querySelector('span').textContent = nPrecio// Precio total

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
    })
}

const btnAccion = e => {
    //https://es.stackoverflow.com/questions/511479/como-se-accede-a-un-array-de-objetos-en-javascript
            
    
    if (e.target.classList.contains('btn-info')) {
        //carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        
        if (producto.cantidad < producto.stock){      
            producto.cantidad++// Incremento la cantidad en 1 por cada producto
            carrito[e.target.dataset.id] = {...producto}
            pintarCarrito()
        }else{
            Swal.fire({
            //icon:'warning',
            imageUrl:'https://i.pinimg.com/originals/14/60/65/146065c2b68c88da7faa0d8b28e26123.gif',
            imageWidth: 100,
            imageHeight: 100,
            title:'ALERTA',
            html:'<p>Has <b>superado el stock</b> del producto</p>',
            html:`<p>Has <b>superado el stock</b> del producto. El stock para este producto es de ${producto.stock} unidades</p>`,
            footer:'<p>Debes bajar la cantidad de unidades pedidas</p>'
            })

        }
            
    }
    

    
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--// Decrementa la cantidad en 1 por cada producto
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }
    

    e.stopPropagation()// Evita la activacion de cualquier comando aleatorio
}

