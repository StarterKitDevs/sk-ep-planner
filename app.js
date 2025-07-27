// SLICEIX LIVE Episode Planner - JavaScript

class EpisodePlanner {
    constructor() {
        this.currentEpisode = null;
        this.episodes = this.loadEpisodes();
        this.autoSaveInterval = null;
        
        // Ensure loading overlay is hidden initially
        this.hideLoading();
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupTabNavigation();
            this.setupAutoSave();
            this.loadSampleDataIfEmpty();
            this.updateHistoryView();
            this.updateSpreadsheetView();
            this.setTodaysDate();
            
            // Ensure we're on the planner tab initially
            this.showTab('planner');
        } catch (error) {
            console.error('Error initializing episode planner:', error);
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('episode-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEpisode();
            });
        }

        // Clear form
        const clearBtn = document.getElementById('clear-form');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }

        // Load sample data
        const sampleBtn = document.getElementById('load-sample');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                this.loadSampleData();
            });
        }

        // Export buttons
        const exportPdfBtn = document.getElementById('export-pdf');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        const exportCsvBtn = document.getElementById('export-csv');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        const shareEmailBtn = document.getElementById('share-email');
        if (shareEmailBtn) {
            shareEmailBtn.addEventListener('click', () => {
                this.shareViaEmail();
            });
        }

        // Refresh history
        const refreshBtn = document.getElementById('refresh-history');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateHistoryView();
            });
        }

        // Date change updates title
        const dateInput = document.getElementById('episode-date');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                this.updateEpisodeTitle(e.target.value);
            });
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.dataset.tab;
                this.showTab(targetTab);
            });
        });
    }

    showTab(targetTab) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Remove active class from all tabs and buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to target button and content
        const targetButton = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
        const targetContent = document.getElementById(`${targetTab}-tab`);
        
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) targetContent.classList.add('active');

        // Update views when switching tabs
        if (targetTab === 'history') {
            this.updateHistoryView();
        } else if (targetTab === 'spreadsheet') {
            this.updateSpreadsheetView();
        }
    }

    setupAutoSave() {
        const formInputs = document.querySelectorAll('#episode-form input, #episode-form textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.autoSaveInterval);
                this.autoSaveInterval = setTimeout(() => {
                    this.autoSaveCurrentForm();
                }, 2000); // Auto-save after 2 seconds of inactivity
            });
        });
    }

    setTodaysDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('episode-date');
        if (dateInput) {
            dateInput.value = today;
            this.updateEpisodeTitle(today);
        }
    }

    updateEpisodeTitle(dateValue) {
        if (dateValue) {
            const date = new Date(dateValue);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const titleInput = document.getElementById('episode-title');
            if (titleInput) {
                titleInput.value = `SLICEIX LIVE - Episode ${formattedDate}`;
            }
        }
    }

    loadSampleDataIfEmpty() {
        if (this.episodes.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleData = {
            date: "2025-07-27",
            title: "SLICEIX LIVE - Episode July 27, 2025",
            hostNotes: "Focus on Web3 music innovations and community engagement",
            newsStories: [
                {
                    title: "Spotify launches NFT playlists for independent artists",
                    link: "https://example.com/news1",
                    timestamp: "15:00",
                    summary: "Major streaming platform enters Web3 space with NFT integration"
                },
                {
                    title: "Major label partners with Web3 streaming platform",
                    link: "https://example.com/news2", 
                    timestamp: "25:00",
                    summary: "Traditional music industry embraces blockchain technology"
                },
                {
                    title: "On-chain royalties: Artist gets first million in DAO payouts",
                    link: "https://example.com/news3",
                    timestamp: "35:00", 
                    summary: "Revolutionary payment system shows real-world success"
                }
            ],
            techTalk: {
                topic: "Sound.xyz platform review and live demo",
                description: "Hands-on demonstration of minting music NFTs and community features",
                timestamp: "40:00"
            },
            tutorial: {
                topic: "How to Mint Your First Music NFT",
                description: "Step-by-step guide for independent artists entering Web3",
                timestamp: "50:00"
            },
            communityNotes: {
                notes: "Focus on listener submissions and portfolio feedback session",
                timestamp: "1:05:00"
            }
        };

        this.populateForm(sampleData);
    }

    populateForm(data) {
        const setFieldValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };

        setFieldValue('episode-date', data.date);
        setFieldValue('episode-title', data.title);
        setFieldValue('host-notes', data.hostNotes);

        // News stories
        if (data.newsStories) {
            data.newsStories.forEach((story, index) => {
                const num = index + 1;
                setFieldValue(`news${num}-title`, story.title);
                setFieldValue(`news${num}-link`, story.link);
                setFieldValue(`news${num}-timestamp`, story.timestamp);
                setFieldValue(`news${num}-summary`, story.summary);
            });
        }

        // Tech talk
        if (data.techTalk) {
            setFieldValue('tech-talk-topic', data.techTalk.topic);
            setFieldValue('tech-talk-description', data.techTalk.description);
            setFieldValue('tech-talk-timestamp', data.techTalk.timestamp || '40:00');
        }

        // Tutorial
        if (data.tutorial) {
            setFieldValue('tutorial-topic', data.tutorial.topic);
            setFieldValue('tutorial-description', data.tutorial.description);
            setFieldValue('tutorial-timestamp', data.tutorial.timestamp || '50:00');
        }

        // Community
        if (data.communityNotes) {
            setFieldValue('community-notes', data.communityNotes.notes);
            setFieldValue('community-timestamp', data.communityNotes.timestamp || '1:05:00');
        }
    }

    getFormData() {
        const getFieldValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        return {
            id: Date.now(),
            date: getFieldValue('episode-date'),
            title: getFieldValue('episode-title'),
            hostNotes: getFieldValue('host-notes'),
            newsStories: [
                {
                    title: getFieldValue('news1-title'),
                    link: getFieldValue('news1-link'),
                    timestamp: getFieldValue('news1-timestamp'),
                    summary: getFieldValue('news1-summary')
                },
                {
                    title: getFieldValue('news2-title'),
                    link: getFieldValue('news2-link'),
                    timestamp: getFieldValue('news2-timestamp'),
                    summary: getFieldValue('news2-summary')
                },
                {
                    title: getFieldValue('news3-title'),
                    link: getFieldValue('news3-link'),
                    timestamp: getFieldValue('news3-timestamp'),
                    summary: getFieldValue('news3-summary')
                }
            ],
            techTalk: {
                topic: getFieldValue('tech-talk-topic'),
                description: getFieldValue('tech-talk-description'),
                timestamp: getFieldValue('tech-talk-timestamp')
            },
            tutorial: {
                topic: getFieldValue('tutorial-topic'),
                description: getFieldValue('tutorial-description'),
                timestamp: getFieldValue('tutorial-timestamp')
            },
            communityNotes: {
                notes: getFieldValue('community-notes'),
                timestamp: getFieldValue('community-timestamp')
            }
        };
    }

    saveEpisode() {
        const formData = this.getFormData();
        
        // Validation
        if (!formData.date || !formData.title) {
            alert('Please fill in the episode date and title.');
            return;
        }

        // Check if episode already exists and update or create new
        const existingIndex = this.episodes.findIndex(ep => ep.date === formData.date);
        
        if (existingIndex !== -1) {
            this.episodes[existingIndex] = formData;
        } else {
            this.episodes.push(formData);
        }

        this.saveEpisodes();
        this.showSuccessMessage('Episode saved successfully!');
        this.updateHistoryView();
        this.updateSpreadsheetView();
    }

    autoSaveCurrentForm() {
        const formData = this.getFormData();
        if (formData.date && formData.title) {
            // Only auto-save if we have essential data
            const existingIndex = this.episodes.findIndex(ep => ep.date === formData.date);
            
            if (existingIndex !== -1) {
                this.episodes[existingIndex] = formData;
                this.saveEpisodes();
            }
        }
    }

    clearForm() {
        if (confirm('Are you sure you want to clear the form? Any unsaved changes will be lost.')) {
            const form = document.getElementById('episode-form');
            if (form) {
                form.reset();
                this.setTodaysDate();
                
                // Reset timestamps to defaults
                const setDefaultValue = (id, value) => {
                    const element = document.getElementById(id);
                    if (element) element.value = value;
                };
                
                setDefaultValue('news1-timestamp', '15:00');
                setDefaultValue('news2-timestamp', '25:00');
                setDefaultValue('news3-timestamp', '35:00');
                setDefaultValue('tech-talk-timestamp', '40:00');
                setDefaultValue('tutorial-timestamp', '50:00');
                setDefaultValue('community-timestamp', '1:05:00');
            }
        }
    }

    loadEpisodes() {
        try {
            const saved = localStorage.getItem('sliceix-episodes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading episodes:', error);
            return [];
        }
    }

    saveEpisodes() {
        try {
            localStorage.setItem('sliceix-episodes', JSON.stringify(this.episodes));
        } catch (error) {
            console.error('Error saving episodes:', error);
        }
    }

    updateHistoryView() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.episodes.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <h4>No Episodes Yet</h4>
                    <p>Start planning your first episode to see it appear here.</p>
                    <button class="btn btn--primary" onclick="planner.showTab('planner')">
                        Create First Episode
                    </button>
                </div>
            `;
            return;
        }

        // Sort episodes by date (most recent first)
        const sortedEpisodes = [...this.episodes].sort((a, b) => new Date(b.date) - new Date(a.date));

        historyList.innerHTML = sortedEpisodes.map(episode => `
            <div class="history-item">
                <div class="history-header">
                    <div>
                        <h4 class="history-title">${episode.title}</h4>
                        <span class="history-date">${this.formatDate(episode.date)}</span>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn--outline btn--sm" onclick="planner.editEpisode('${episode.date}')">
                            Edit
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="planner.duplicateEpisode('${episode.date}')">
                            Duplicate
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="planner.deleteEpisode('${episode.date}')">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="history-content">
                    ${episode.newsStories.filter(story => story.title).map(story => `
                        <div class="history-section">
                            <h5>News: ${story.timestamp}</h5>
                            <p><strong>${story.title}</strong><br>${story.summary}</p>
                        </div>
                    `).join('')}
                    ${episode.techTalk.topic ? `
                        <div class="history-section">
                            <h5>Tech Talk: ${episode.techTalk.timestamp}</h5>
                            <p><strong>${episode.techTalk.topic}</strong><br>${episode.techTalk.description}</p>
                        </div>
                    ` : ''}
                    ${episode.tutorial.topic ? `
                        <div class="history-section">
                            <h5>Tutorial: ${episode.tutorial.timestamp}</h5>
                            <p><strong>${episode.tutorial.topic}</strong><br>${episode.tutorial.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateSpreadsheetView() {
        const tableBody = document.querySelector('#spreadsheet-table tbody');
        if (!tableBody) return;
        
        if (this.episodes.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        No episodes to display. Create your first episode in the planner tab.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort episodes by date (most recent first)
        const sortedEpisodes = [...this.episodes].sort((a, b) => new Date(b.date) - new Date(a.date));

        tableBody.innerHTML = sortedEpisodes.map(episode => `
            <tr>
                <td>${this.formatDate(episode.date)}</td>
                <td><strong>${episode.title}</strong></td>
                <td>${this.formatNewsStory(episode.newsStories[0])}</td>
                <td>${this.formatNewsStory(episode.newsStories[1])}</td>
                <td>${this.formatNewsStory(episode.newsStories[2])}</td>
                <td>${episode.techTalk.topic || '-'}</td>
                <td>${episode.tutorial.topic || '-'}</td>
                <td>${episode.communityNotes.notes ? episode.communityNotes.notes.substring(0, 50) + '...' : '-'}</td>
            </tr>
        `).join('');
    }

    formatNewsStory(story) {
        if (!story || !story.title) return '-';
        const link = story.link ? `<a href="${story.link}" target="_blank">${story.title}</a>` : story.title;
        return `<div class="text-small">${link}</div>`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    editEpisode(date) {
        const episode = this.episodes.find(ep => ep.date === date);
        if (episode) {
            this.populateForm(episode);
            // Switch to planner tab
            this.showTab('planner');
        }
    }

    duplicateEpisode(date) {
        const episode = this.episodes.find(ep => ep.date === date);
        if (episode) {
            const duplicate = { ...episode };
            duplicate.date = new Date().toISOString().split('T')[0];
            duplicate.title = `SLICEIX LIVE - Episode ${this.formatDate(duplicate.date)}`;
            delete duplicate.id;
            
            this.populateForm(duplicate);
            // Switch to planner tab
            this.showTab('planner');
        }
    }

    deleteEpisode(date) {
        if (confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
            this.episodes = this.episodes.filter(ep => ep.date !== date);
            this.saveEpisodes();
            this.updateHistoryView();
            this.updateSpreadsheetView();
            this.showSuccessMessage('Episode deleted successfully!');
        }
    }

    exportToPDF() {
        this.showLoading();
        
        setTimeout(() => {
            const currentEpisode = this.getFormData();
            
            if (!currentEpisode.date || !currentEpisode.title) {
                this.hideLoading();
                alert('Please fill in the episode date and title before exporting.');
                return;
            }

            const pdfContent = this.generatePDFContent(currentEpisode);
            
            const opt = {
                margin: 1,
                filename: `SLICEIX-Episode-${currentEpisode.date}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().from(pdfContent).set(opt).save().then(() => {
                this.hideLoading();
                this.showSuccessMessage('PDF exported successfully!');
            }).catch((error) => {
                console.error('PDF export error:', error);
                this.hideLoading();
                alert('Error exporting PDF. Please try again.');
            });
        }, 500);
    }

    generatePDFContent(episode) {
        return `
            <div class="pdf-content">
                <div class="pdf-header">
                    <h1 class="pdf-title">SLICEIX LIVE</h1>
                    <p class="pdf-subtitle">The Ultimate Web3 Music Livestream 🚀</p>
                    <p class="pdf-date">${episode.title}</p>
                </div>
                
                <div class="pdf-section">
                    <h3>Episode Timeline</h3>
                    <ul class="pdf-timeline">
                        <li>
                            <span class="pdf-time">00:00</span>
                            <span class="pdf-content-text">Scene Setting & Web3 Music News</span>
                        </li>
                        ${episode.newsStories.filter(story => story.title).map(story => `
                            <li>
                                <span class="pdf-time">${story.timestamp}</span>
                                <div class="pdf-content-text">
                                    <div class="pdf-news-item">
                                        <div class="pdf-news-title">${story.title}</div>
                                        <div class="pdf-news-summary">${story.summary}</div>
                                        ${story.link ? `<div class="pdf-news-link">${story.link}</div>` : ''}
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                        ${episode.techTalk.topic ? `
                            <li>
                                <span class="pdf-time">${episode.techTalk.timestamp}</span>
                                <div class="pdf-content-text">
                                    <strong>Tech Talk:</strong> ${episode.techTalk.topic}<br>
                                    ${episode.techTalk.description}
                                </div>
                            </li>
                        ` : ''}
                        ${episode.tutorial.topic ? `
                            <li>
                                <span class="pdf-time">${episode.tutorial.timestamp}</span>
                                <div class="pdf-content-text">
                                    <strong>Creator Tutorial:</strong> ${episode.tutorial.topic}<br>
                                    ${episode.tutorial.description}
                                </div>
                            </li>
                        ` : ''}
                        <li>
                            <span class="pdf-time">${episode.communityNotes.timestamp}</span>
                            <div class="pdf-content-text">
                                <strong>Community Q&A:</strong><br>
                                ${episode.communityNotes.notes || 'Live Q&A and community feedback session'}
                            </div>
                        </li>
                    </ul>
                </div>
                
                ${episode.hostNotes ? `
                    <div class="pdf-section">
                        <h3>Host Notes</h3>
                        <p>${episode.hostNotes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    exportToCSV() {
        if (this.episodes.length === 0) {
            alert('No episodes to export. Create some episodes first.');
            return;
        }

        const headers = [
            'Date', 'Episode Title', 'Host Notes',
            'News Story 1 Title', 'News Story 1 Link', 'News Story 1 Summary',
            'News Story 2 Title', 'News Story 2 Link', 'News Story 2 Summary', 
            'News Story 3 Title', 'News Story 3 Link', 'News Story 3 Summary',
            'Tech Talk Topic', 'Tech Talk Description',
            'Tutorial Topic', 'Tutorial Description',
            'Community Notes'
        ];

        const csvData = this.episodes.map(episode => [
            episode.date,
            episode.title,
            episode.hostNotes,
            episode.newsStories[0]?.title || '',
            episode.newsStories[0]?.link || '',
            episode.newsStories[0]?.summary || '',
            episode.newsStories[1]?.title || '',
            episode.newsStories[1]?.link || '',
            episode.newsStories[1]?.summary || '',
            episode.newsStories[2]?.title || '',
            episode.newsStories[2]?.link || '',
            episode.newsStories[2]?.summary || '',
            episode.techTalk.topic,
            episode.techTalk.description,
            episode.tutorial.topic,
            episode.tutorial.description,
            episode.communityNotes.notes
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${(field || '')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SLICEIX-Episodes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.showSuccessMessage('CSV exported successfully!');
    }

    shareViaEmail() {
        const currentEpisode = this.getFormData();
        
        if (!currentEpisode.date || !currentEpisode.title) {
            alert('Please fill in the episode date and title before sharing.');
            return;
        }

        const subject = `SLICEIX LIVE Episode Plan - ${currentEpisode.title}`;
        const newsStories = currentEpisode.newsStories
            .filter(story => story.title)
            .map((story, index) => 
                `${story.timestamp} - ${story.title}\n${story.summary}${story.link ? `\nLink: ${story.link}` : ''}`
            ).join('\n\n');

        const body = `
SLICEIX LIVE Episode Plan
${currentEpisode.title}
Date: ${this.formatDate(currentEpisode.date)}

HOST NOTES:
${currentEpisode.hostNotes}

EPISODE TIMELINE:

00:00 - Scene Setting & Web3 Music News

NEWS STORIES:
${newsStories}

${currentEpisode.techTalk.topic ? `${currentEpisode.techTalk.timestamp} - Tech Talk: ${currentEpisode.techTalk.topic}\n${currentEpisode.techTalk.description}\n` : ''}

${currentEpisode.tutorial.topic ? `${currentEpisode.tutorial.timestamp} - Creator Tutorial: ${currentEpisode.tutorial.topic}\n${currentEpisode.tutorial.description}\n` : ''}

${currentEpisode.communityNotes.timestamp} - Community Q&A
${currentEpisode.communityNotes.notes}

---
Generated by SLICEIX LIVE Episode Planner
        `.trim();

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showSuccessMessage(message) {
        const successElement = document.getElementById('success-message');
        if (!successElement) return;
        
        const textElement = successElement.querySelector('.success-text');
        if (textElement) {
            textElement.textContent = message;
        }
        
        successElement.classList.remove('hidden');
        
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.planner = new EpisodePlanner();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.planner) {
            window.planner = new EpisodePlanner();
        }
    });
} else {
    // DOM already loaded
    if (!window.planner) {
        window.planner = new EpisodePlanner();
    }
}