// Select all anchor elements inside elements with the class 'menu'
const links = document.querySelectorAll('a');
const home = document.getElementById('Home');

let container;

// Loop through each link and add a click event listener
links.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        
        e.preventDefault();

        let elementId = this.getAttribute('href').replace('#', '');

        if (elementId === 'Home') {
            container.style.transition = 'transform 0.5s ease';
            container.style.transform = `translateX(${window.innerWidth}px)`;

            home.style.transition = 'transform 0.5s ease';
            home.style.transform = `translateX(${0}px)`;
            // Change the URL hash to #Home
            window.location.hash = '#Home';
            return;
        }
        container = document.getElementById(elementId);

        console.log("Element ID : '" + elementId + "' Container: '" + container + "'");

        // Change the URL hash to the clicked section
        window.location.hash = '#' + elementId;

        container.style.transition = 'transform 0.5s ease';
        container.style.transform = `translateX(-${window.innerWidth}px)`;
        
        home.style.transition = 'transform 0.5s ease';
        home.style.transform = `translateX(-${window.innerWidth}px)`;
    });
});