import riIcons from '@iconify/json/json/ri.json';

window.renderIconSelect = function (targetSelector, options = {}) {

    const target = document.querySelector(targetSelector);
    if (!target) {
        console.error("No se encontró el elemento destino:", targetSelector);
        return;
    } 

    const icons = riIcons.icons;
    const iconNames = Object.keys(icons);

    // Configuración por defecto
    const {
        selectId = 'selectIcono',
        selectClass = 'form-select',
        placeholder = 'Selecciona un icono…',
        showPreview = true, // opcional: si se desea mostrar ícono al seleccionar
    } = options;

    // Crear <select>
    const select = document.createElement('select');
    select.id = selectId;
    select.className = selectClass;

    // Placeholder
    const optPlaceholder = document.createElement('option');
    optPlaceholder.value = "";
    optPlaceholder.textContent = placeholder;
    optPlaceholder.disabled = true;
    optPlaceholder.selected = true;
    select.appendChild(optPlaceholder);

    // Agregar opciones
    iconNames.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    // Colocar select dentro del target
    target.appendChild(select);


    // Opcional: preview dinámico del ícono seleccionado
    if (showPreview) {
        const preview = document.createElement('div');
        preview.id = selectId + '_preview';
        preview.className = 'mt-2 fs-2';

        select.addEventListener('change', () => {
            preview.innerHTML = `<i class="ri ri-${select.value}"></i>`;
        });

        target.appendChild(preview);
    }

    console.log("Select de íconos generado en:", targetSelector);
};
