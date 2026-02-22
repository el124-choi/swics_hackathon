
// Star rating functionality
document.querySelectorAll('.stars').forEach(starsContainer => {
    const stars = starsContainer.querySelectorAll('.star');
    const ratingType = starsContainer.dataset.rating;
    const hiddenInput = document.getElementById(`${ratingType}Rating`);

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            hiddenInput.value = value;

            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseenter', () => {
            const value = parseInt(star.dataset.value);
            stars.forEach((s, index) => {
                if (index < value) {
                    s.style.color = '#ffd700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        starsContainer.addEventListener('mouseleave', () => {
            const currentValue = parseInt(hiddenInput.value) || 0;
            stars.forEach((s, index) => {
                if (index < currentValue) {
                    s.style.color = '#ffd700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
});

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'submit') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('submit-tab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('browse-tab').classList.add('active');
        displayReviews();
    }
}

// Show toast notification
function showToast() {
    const toast = document.getElementById('toastNotification');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000); // Disappears after 5 seconds
}

// Handle form submission
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const review = {
        url: document.getElementById('websiteUrl').value,
        inclusivity: parseInt(document.getElementById('inclusivityRating').value),
        lgbtq: parseInt(document.getElementById('lgbtqRating').value),
        ui: parseInt(document.getElementById('uiRating').value),
        usefulness: parseInt(document.getElementById('usefulnessRating').value),
        reviewText: document.getElementById('reviewText').value,
        date: new Date().toISOString()
    };

    // Validate all ratings are filled
    if (!review.inclusivity || !review.lgbtq || !review.ui || !review.usefulness) {
        alert('Please provide all ratings before submitting.');
        return;
    }

    // Store in localStorage (in production, this would be a database)
    const reviews = JSON.parse(localStorage.getItem('websiteReviews') || '[]');
    reviews.push(review);
    localStorage.setItem('websiteReviews', JSON.stringify(reviews));

    // Show toast notification
    showToast();

    // Reset form
    document.getElementById('reviewForm').reset();
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    document.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
});

// Search functionality
document.getElementById('searchUrl').addEventListener('input', (e) => {
    displayReviews(e.target.value);
});

// Display reviews
function displayReviews(searchTerm = '') {
    const reviews = JSON.parse(localStorage.getItem('websiteReviews') || '[]');
    const reviewsList = document.getElementById('reviewsList');

    let filteredReviews = reviews;
    if (searchTerm) {
        filteredReviews = reviews.filter(review => 
            review.url.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <div class="no-reviews-icon">🔍</div>
                <h3>${searchTerm ? 'No reviews found' : 'No reviews yet'}</h3>
                <p>${searchTerm ? 'Try searching for a different URL' : 'Be the first to submit a review!'}</p>
            </div>
        `;
        return;
    }

    // Group reviews by URL and calculate averages
    const groupedReviews = {};
    filteredReviews.forEach(review => {
        if (!groupedReviews[review.url]) {
            groupedReviews[review.url] = [];
        }
        groupedReviews[review.url].push(review);
    });

    let html = '';
    Object.keys(groupedReviews).forEach(url => {
        const siteReviews = groupedReviews[url];
        const avgInclusivity = (siteReviews.reduce((sum, r) => sum + r.inclusivity, 0) / siteReviews.length).toFixed(1);
        const avgLgbtq = (siteReviews.reduce((sum, r) => sum + r.lgbtq, 0) / siteReviews.length).toFixed(1);
        const avgUi = (siteReviews.reduce((sum, r) => sum + r.ui, 0) / siteReviews.length).toFixed(1);
        const avgUsefulness = (siteReviews.reduce((sum, r) => sum + r.usefulness, 0) / siteReviews.length).toFixed(1);
        const overallAvg = ((parseFloat(avgInclusivity) + parseFloat(avgLgbtq) + parseFloat(avgUi) + parseFloat(avgUsefulness)) / 4).toFixed(1);

        html += `
            <div class="review-card">
                <div class="review-header">
                    <a href="${url}" target="_blank" class="website-link">${url}</a>
                    <span class="average-rating">⭐ ${overallAvg} / 5.0</span>
                </div>
                <div class="ratings-summary">
                    <div class="rating-item">
                        <div class="rating-item-label">Inclusivity</div>
                        <div class="rating-item-stars">${'★'.repeat(Math.round(avgInclusivity))}${'☆'.repeat(5-Math.round(avgInclusivity))} ${avgInclusivity}</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-item-label">LGBTQ+ Friendly</div>
                        <div class="rating-item-stars">${'★'.repeat(Math.round(avgLgbtq))}${'☆'.repeat(5-Math.round(avgLgbtq))} ${avgLgbtq}</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-item-label">User Interface</div>
                        <div class="rating-item-stars">${'★'.repeat(Math.round(avgUi))}${'☆'.repeat(5-Math.round(avgUi))} ${avgUi}</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-item-label">Usefulness</div>
                        <div class="rating-item-stars">${'★'.repeat(Math.round(avgUsefulness))}${'☆'.repeat(5-Math.round(avgUsefulness))} ${avgUsefulness}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; color: #666;">
                    <strong>${siteReviews.length}</strong> review${siteReviews.length > 1 ? 's' : ''}
                </div>
        `;

        // Show individual reviews
        siteReviews.forEach(review => {
            const date = new Date(review.date).toLocaleDateString();
            html += `
                <div class="review-text">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: 600; color: #667eea;">Review</span>
                        <span class="review-date">${date}</span>
                    </div>
                    ${review.reviewText}
                </div>
            `;
        });

        html += `</div>`;
    });

    reviewsList.innerHTML = html;
}

// Initialize
displayReviews();
