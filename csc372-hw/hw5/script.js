document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const usernameInput = document.getElementById('github-username');
    const gallery = document.getElementById('gallery');

    // Function to create a repository card
    function createRepoCard(repo) {
        return `
        <div class="card">
            <h3><i class="fa-brands fa-github"></i> ${repo.name}</h3>
            <div class="details">
                <span><i class="fa-solid fa-star"></i> ${repo.watchers_count}</span>
                <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count}</span>
            </div>
            <p>${repo.description || 'No description available'}</p>
            <p><strong>Commits:</strong> ${repo.commits}</p>
            <p><strong>Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
            <p><strong>Created:</strong> ${new Date(repo.created_at).toLocaleDateString()}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
        </div>
    `;
    }

    // Fetch the repositories from GitHub API
    function fetchRepos(username) {
        const url = `https://api.github.com/users/${username}/repos`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                gallery.innerHTML = '';

                data.forEach(repo => {
                    fetch(`${repo.url}/commits`)
                        .then(response => response.json())
                        .then(commits => {
                            const repoData = {
                                ...repo,
                                commits: commits.length
                            };
                            gallery.innerHTML += createRepoCard(repoData);
                        });
                });
            })
            .catch(error => {
                gallery.innerHTML = '<p>Error fetching repositories. Please try again.</p>';
            });
    }

    // Default fetch when the page loads
    fetchRepos('kimchidude');

    // Function to handle search
    function handleSearch() {
        const username = usernameInput.value.trim();
        if (username) {
            fetchRepos(username);
        }
    }

    // Fetch repos when search button is clicked
    searchBtn.addEventListener('click', handleSearch);

    // Fetch repos when the Enter key is pressed in the input field
    usernameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            handleSearch();
        }
    });
});
