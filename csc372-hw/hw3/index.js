function expand(event) {
    const smallImage = event.currentTarget;
    const bigImage = document.querySelector(".big");

    // Reset previous big image to small
    if (bigImage) {
        bigImage.classList.remove('big');
        bigImage.classList.add('small');
        bigImage.parentNode.classList.remove('active');
    }

    // Expand the clicked image
    smallImage.classList.remove('small');
    smallImage.classList.add('big');
    smallImage.parentNode.classList.add('active');  // Show description for this item
}

// Add event listener to all images
const images = document.querySelectorAll('.small');
images.forEach(image => image.addEventListener('click', expand));
