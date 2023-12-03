function iniciarApp(){
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    if (selectCategorias){
        selectCategorias.addEventListener('change',seleccionarCategoria);
        obtenerCategorias();
    }
    const favoritosDiv= document.querySelector('.favoritos')
   if(favoritosDiv){
    obtenerFavoritoS();
   }
    
    const modal = new bootstrap.Modal('#modal',{});


    function obtenerCategorias(){
        const url= 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
        .then(respuesta=>{
            return respuesta.json();
        }).then(resultado=>{
            
            mostrarCategorias(resultado.categories)

        })
    }

    function mostrarCategorias(categorias=[]){
        categorias.forEach(categoria=>{
            const {strCategory}=categoria;
            const option= document.createElement('OPTION');
            option.textContent=strCategory;
            option.value=strCategory;
            selectCategorias.appendChild(option);
            
        });
    }


    function seleccionarCategoria(e){
        const categoria = e.target.value;
        
        const url= `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        
        fetch(url)
        .then(respuesta=>respuesta.json())
        .then(resultado=>mostrarRecetas(resultado.meals))
        .catch(error=>console.log('error'))
    }

    function mostrarRecetas(recetas=[]){
        limpiarHTML(resultado);
        

        const heading =document.createElement('H2');
        heading.classList.add('text-center','text-black', 'my-5');
        heading.textContent= recetas.length ? 'Resultado' : 'No hay resultados';

        resultado.appendChild(heading);
       //iterar en los resultados
       recetas.forEach(receta=>{
       
        //crear un card 
        const {idMeal,strMeal,strMealThumb}=receta;
            const recetaContenedor= document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4')
            
            const recetaCard= document.createElement('DIV');
            recetaCard.classList.add('card','mb-4');

            const recetaImagen= document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt=`Imagen de la receta ${strMeal ?? receta.nombre}`;
            recetaImagen.src=strMealThumb ?? receta.img;

            const recetaCardBody= document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading=document.createElement('H3');
            recetaHeading.classList.add('card-title','mb-3');
            recetaHeading.textContent= strMeal ?? receta.nombre;

            const recetaButton= document.createElement('BUTTON');
            recetaButton.classList.add('btn','btn-danger','w-100');
            recetaButton.textContent='Ver receta';
            
            recetaButton.onclick=function(){
                seleccionarReceta(idMeal ?? receta.id);
            }

            // recetaButton.dataset.bsTarget="#modal";
            // recetaButton.dataset.bsToggle="modal";
            
            //inyectar en el html 

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

       });
    }

    function seleccionarReceta(id){
       const url =`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
        .then(respuesta=>respuesta.json())
        .then(resultado=> mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta){
       
      
        const {idMeal,strInstructions,strMeal,strMealThumb}=receta;
        const modalTitle= document.querySelector('.modal .modal-title');
        const modalBody= document.querySelector('.modal .modal-body');

        modalTitle.textContent=strMeal;
        modalBody.innerHTML=`
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
        <h3 class="my-3">Instrucciones: </h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y cantidades: </h3>
        `;
        //mostrar cantidades e ingredientes
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        for (let i = 1; i <20; i++) {
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLI=document.createElement('LI');
                ingredienteLI.classList.add('list-group-item');
                ingredienteLI.textContent=`${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLI);

            }
            
        }
        modalBody.appendChild(listGroup);

        const modalFooter= document.querySelector('.modal-footer')
        limpiarHTML(modalFooter);
                //btotnes de agregar a favorito y cerrar 

                const btnFavorito=document.createElement('BUTTON');
                btnFavorito.classList.add('btn', 'btn-danger','col');
                btnFavorito.textContent=existeStorage(idMeal)? 'Eliminar de Favoritos' : 'Guardar en Favoritos';
               
                const btnCerrar=document.createElement('BUTTON');
                btnCerrar.classList.add('btn', 'btn-secondary','col');
                btnCerrar.textContent='Cerrar';

                modalFooter.appendChild(btnFavorito);
                modalFooter.appendChild(btnCerrar);

            //funciones de cada boton
            btnCerrar.onclick=function(){
                modal.hide();
            }

            //localstorage
            btnFavorito.onclick=function(){

            //eliminar duplicados
            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent='Guardar en Favoritos';
                mostrarToast('Eliminado de favoritos correctamente');
                return;
             }

                guradarFavorito({
                    id:idMeal,
                    nombre:strMeal,
                    img:strMealThumb,
                });
                btnFavorito.textContent='Eliminar de Favoritos';
                mostrarToast('Guardado en favoritos correctamente');
            }
             //muestra el modal 
        modal.show();

    }
    function mostrarToast(mensaje){
        const toastDiv= document.querySelector('#toast');
        const toastBody= document.querySelector('.toast-body');
        const toast= new bootstrap.Toast(toastDiv);
        toastBody.textContent=mensaje;
        toast.show()

    }



    function eliminarFavorito(id){
        const favorito = JSON.parse(localStorage.getItem('favoritos')) ?? [];

        const nuevoFavorito= favorito.filter(favorito=> favorito.id !== id);

        localStorage.setItem('favoritos', JSON.stringify(nuevoFavorito));

    }
    function guradarFavorito(receta){
        const favorito = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favorito, receta]));
       
    }

    function existeStorage(id){
        const favorito = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favorito.some(receta=>receta.id===id);
   }
   function obtenerFavoritoS(){
    const favorito = JSON.parse(localStorage.getItem('favoritos')) ?? [];
   if(favorito.length){
    mostrarRecetas(favorito);
    
        return;
   }

   const noHayFavoritos= document.createElement('P');
   noHayFavoritos.textContent='No hay favoritos aun.'
   noHayFavoritos.classList.add('fs-4','text-center','font-bold','mt-5');
   favoritosDiv.appendChild(noHayFavoritos);
    }

    function limpiarHTML(selector){
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

    
}

window.addEventListener('DOMContentLoaded',()=>{
    iniciarApp();

})