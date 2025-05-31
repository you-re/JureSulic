// Select all anchor elements inside elements with the class 'menu'
const links = document.querySelectorAll('a');

let container;

// Loop through each link and add a click event listener
links.forEach(anchor => {
    anchor.addEventListener('click', function(e) {

        let elementId = this.getAttribute('href').replace('#', '');

        if (elementId === 'Home') {
            container.style.transition = 'transform 0.5s ease';
            container.style.transform = `translateX(${window.innerWidth}px)`;
            return;
        }
        container = document.getElementById(elementId);

        console.log("Element ID : '" + elementId + "' Container: '" + container + "'");

        e.preventDefault();

        // Find the index of the clicked anchor dynamically
        // const index = Array.from(links).indexOf(this);
        container.style.transition = 'transform 0.5s ease';
        container.style.transform = `translateX(-${window.innerWidth}px)`;
    });
});