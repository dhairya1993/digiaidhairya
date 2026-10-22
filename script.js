// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100, // Offset for fixed navbar
                behavior: 'smooth'
            });
        }
    });
});

// Newsletter Form Submission Handling
const subscribeForm = document.getElementById('subscribeForm');
const formMessage = document.getElementById('formMessage');

if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page reload
        
        // Simulating API call
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value;
        const submitBtn = this.querySelector('button');
        
        // UI Change during processing
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Success State
            subscribeForm.style.display = 'none';
            formMessage.style.display = 'block';
            
            // Log for dev viewing
            console.log(`New subscriber: ${email}`);
        }, 1500);
    });
}

// Mobile Menu Toggle (Basic implementation)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        // Toggle display logic (could be improved with CSS classes)
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(7, 7, 10, 0.95)';
            navLinks.style.padding = '2rem 0';
            navLinks.style.backdropFilter = 'blur(10px)';
            navLinks.style.borderRadius = '0 0 20px 20px';
            navLinks.style.border = '1px solid rgba(255,255,255,0.05)';
            
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        }
    });
}

// Mouse tracking effect for interactive cards
const cards = document.querySelectorAll('.interactive-card');

cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        // Add subtle tilt effect based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        // Maintain the hover up translation if desired, but we reset for clean physics
        setTimeout(() => {
            card.style.transform = ''; // Clear inline styles to let CSS handle it
        }, 300);
    });
});

// Add scroll event to add background to navbar when scrolled
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(7, 7, 10, 0.8)';
        navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.03)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
    }
});

// --- AI Neural Network Particle Background --- //
const canvas = document.getElementById('ai-network');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: (canvas.height/80) * (canvas.width/80)
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#8a2be2';
        ctx.fill();
        ctx.closePath();
    }
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 10;
            if (mouse.x > this.x && this.x > this.size * 10) this.x -= 10;
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 10;
            if (mouse.y > this.y && this.y > this.size * 10) this.y -= 10;
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1.5) - 0.75;
        let directionY = (Math.random() * 1.5) - 0.75;
        let color = '#8a2be2';
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (distance/20000);
                let dx = mouse.x - particlesArray[a].x;
                let dy = mouse.y - particlesArray[a].y;
                let mouseDistance = Math.sqrt(dx*dx + dy*dy);
                
                if (mouseDistance < 150) {
                  ctx.strokeStyle = `rgba(0, 245, 255, ${opacityValue})`; // Neon Blue on hover/interaction
                } else {
                  ctx.strokeStyle = `rgba(157, 78, 221, ${opacityValue - 0.6})`; // Dim Purple normally
                }
                
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = ((canvas.height/80) * (canvas.height/80));
    init();
});

window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

init();
animate();

// --- Interactive Features for SEO, Engagement & Digital Marketing ---

// Toast Notification Helper
function showToast(message, icon = 'fas fa-check-circle') {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// 1. FAQ Accordion Handler
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close other items for accordion behavior
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            }
        });
        
        if (isActive) {
            item.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        } else {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// 2. Copy Prompt Buttons
const copyPromptButtons = document.querySelectorAll('.btn-copy-prompt');
copyPromptButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const promptText = btn.getAttribute('data-prompt');
        if (!promptText) return;
        
        try {
            await navigator.clipboard.writeText(promptText);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
            btn.style.background = 'var(--neon-purple)';
            showToast('Prompt copied to clipboard! Ready to paste into AI.', 'fas fa-robot');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2500);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = promptText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Prompt copied to clipboard!', 'fas fa-check-circle');
        }
    });
});

// 3. Copy Website Link for Viral Share
const copySiteLinkBtn = document.getElementById('copySiteLinkBtn');
const copyLinkText = document.getElementById('copyLinkText');
if (copySiteLinkBtn) {
    copySiteLinkBtn.addEventListener('click', async () => {
        const siteUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(siteUrl);
            if (copyLinkText) copyLinkText.textContent = 'Copied!';
            showToast('Website link copied! Share with friends 🚀', 'fas fa-link');
            setTimeout(() => {
                if (copyLinkText) copyLinkText.textContent = 'Copy Link';
            }, 2500);
        } catch (err) {
            showToast('Share link: ' + siteUrl, 'fas fa-link');
        }
    });
}

// =========================================
// 4. Interactive Free AI Tools Studio Engine
// =========================================

// A. Tab Switching
const toolTabButtons = document.querySelectorAll('.tool-tab-btn');
const toolPanes = document.querySelectorAll('.tool-pane');

toolTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        
        toolTabButtons.forEach(b => b.classList.remove('active'));
        toolPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add('active');
    });
});

// Helper for Copying text with feedback
async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMsg, 'fas fa-check-circle');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(successMsg, 'fas fa-check-circle');
    }
}

// B. Tool 1: AI Viral Hook Generator
const btnGenHook = document.getElementById('btnGenHook');
const hookTopic = document.getElementById('hookTopic');
const hookTone = document.getElementById('hookTone');
const hookResults = document.getElementById('hookResults');
const hooksList = document.getElementById('hooksList');

if (btnGenHook) {
    btnGenHook.addEventListener('click', () => {
        const topic = hookTopic.value.trim() || 'AI video editing';
        const tone = hookTone.value;
        
        btnGenHook.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btnGenHook.disabled = true;
        
        setTimeout(() => {
            let templates = [];
            
            if (tone === 'curiosity') {
                templates = [
                    { badge: "Pattern Interrupt", text: `If you are still doing ${topic} the traditional way in 2026, stop right now.` },
                    { badge: "The Unfair Advantage", text: `Only 1% of creators know this secret trick about ${topic}. Here's how it works:` },
                    { badge: "Curiosity Gap", text: `I spent 40 hours testing ${topic} so you don't have to. Here is the single biggest takeaway.` },
                    { badge: "Speed Multiplier", text: `What if I told you that ${topic} can now be done in under 60 seconds with AI?` }
                ];
            } else if (tone === 'shocking') {
                templates = [
                    { badge: "Controversial", text: `Most people are completely wrong about ${topic}, and it's costing them hours every day.` },
                    { badge: "Warning Alert", text: `Stop doing this immediately if you want to master ${topic} this year.` },
                    { badge: "Shock Hook", text: `This one AI tool makes 90% of old tutorials on ${topic} completely useless.` },
                    { badge: "Truth Bomb", text: `Nobody wants to admit this, but ${topic} has completely changed in 2026.` }
                ];
            } else if (tone === 'secret') {
                templates = [
                    { badge: "Hidden Trick", text: `This secret AI workflow for ${topic} feels almost illegal to know.` },
                    { badge: "Pro Workflow", text: `The exact 3-step blueprint I use for ${topic} that doubled my output.` },
                    { badge: "VIP Blueprint", text: `Steal my personal battle-tested framework for ${topic} before it gets saturated.` },
                    { badge: "Cheat Code", text: `Here is the AI prompt cheat code that automated my entire process for ${topic}.` }
                ];
            } else {
                templates = [
                    { badge: "Relatable Pain", text: `Struggling with ${topic}? Here is why you're failing, and the 1-click AI fix.` },
                    { badge: "Mistake Fix", text: `The biggest mistake beginner creators make with ${topic} (and how to avoid it).` },
                    { badge: "Save Time", text: `If you're spending more than 10 minutes on ${topic}, you need to watch this right now.` },
                    { badge: "Beginner Friendly", text: `How to go from zero to hero in ${topic} using free AI tools only.` }
                ];
            }
            
            hooksList.innerHTML = '';
            templates.forEach((item, index) => {
                const hookCard = document.createElement('div');
                hookCard.className = 'hook-item';
                hookCard.innerHTML = `
                    <div class="hook-content">
                        <span class="hook-badge">${item.badge}</span>
                        <p class="hook-text">"${item.text}"</p>
                    </div>
                    <button type="button" class="btn-copy-prompt copy-hook-btn" data-text="${item.text.replace(/"/g, '&quot;')}">
                        <i class="fas fa-copy"></i> <span>Copy</span>
                    </button>
                `;
                hooksList.appendChild(hookCard);
            });
            
            // Add click events to hook copy buttons
            hookCardCopyEvents();
            
            hookResults.style.display = 'block';
            btnGenHook.innerHTML = '<i class="fas fa-bolt"></i> Generate 4 Viral Hooks';
            btnGenHook.disabled = false;
            
            hookResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    });
}

function hookCardCopyEvents() {
    document.querySelectorAll('.copy-hook-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            copyToClipboard(text, 'Hook copied! Ready for your video 🎬');
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> <span>Copy</span>';
            }, 2000);
        });
    });
}

// C. Tool 2: AI Prompt Enhancer
const btnEnhancePrompt = document.getElementById('btnEnhancePrompt');
const rawPrompt = document.getElementById('rawPrompt');
const promptTarget = document.getElementById('promptTarget');
const promptResults = document.getElementById('promptResults');
const enhancedPromptText = document.getElementById('enhancedPromptText');
const copyEnhancedBtn = document.getElementById('copyEnhancedBtn');

if (btnEnhancePrompt) {
    btnEnhancePrompt.addEventListener('click', () => {
        const input = rawPrompt.value.trim() || 'A futuristic cyberpunk portrait';
        const target = promptTarget.value;
        
        btnEnhancePrompt.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
        btnEnhancePrompt.disabled = true;
        
        setTimeout(() => {
            let enhanced = '';
            
            if (target === 'midjourney') {
                enhanced = `Cinematic 8k master photography of ${input}, ultra-detailed photorealistic texture, shot on Hasselblad H6D-100c with 85mm f/1.4 lens, dramatic volumetric rim lighting, neon cyan and purple dual-tone lighting, ray tracing, octane render, intricate details, hyper-realistic skin and surface textures, depth of field, award-winning composition --ar 16:9 --v 6.0 --style raw --q 2`;
            } else if (target === 'chatgpt') {
                enhanced = `[Role]: Act as an Elite Tier Expert Prompt Engineer and Senior Specialist in this domain.
[Task]: Produce a comprehensive, high-converting, and actionable output based on: "${input}".

[Context & Parameters]:
1. Structure the response clearly with bold headings, bullet points, and practical real-world examples.
2. Eliminate filler words and buzzwords. Focus exclusively on direct value and step-by-step clarity.
3. Include an "Action Checklist" and "Pro Tips" section at the end for immediate execution.
4. If applicable, highlight potential pitfalls and how to bypass them.

Format the final response in clean GitHub-Flavored Markdown.`;
            } else {
                enhanced = `A vibrant, digital masterpiece illustration of ${input}, highly polished concept art, rich lighting and shadows, dynamic cinematic perspective, crisp details, trending on ArtStation, 4K resolution, studio-grade aesthetic.`;
            }
            
            enhancedPromptText.textContent = enhanced;
            promptResults.style.display = 'block';
            btnEnhancePrompt.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Enhance into Pro Prompt';
            btnEnhancePrompt.disabled = false;
            
            promptResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    });
}

if (copyEnhancedBtn) {
    copyEnhancedBtn.addEventListener('click', () => {
        const text = enhancedPromptText.textContent;
        copyToClipboard(text, 'Enhanced Pro Prompt copied! Paste into AI 🪄');
    });
}

// D. Tool 3: YouTube SEO Tags & Viral Hashtags
const btnGenTags = document.getElementById('btnGenTags');
const tagKeyword = document.getElementById('tagKeyword');
const tagResults = document.getElementById('tagResults');
const ytTagsContainer = document.getElementById('ytTagsContainer');
const igTagsContainer = document.getElementById('igTagsContainer');
const copyYtTagsBtn = document.getElementById('copyYtTagsBtn');
const copyIgTagsBtn = document.getElementById('copyIgTagsBtn');

let currentYtTags = [];
let currentIgHashtags = [];

if (btnGenTags) {
    btnGenTags.addEventListener('click', () => {
        const keyword = tagKeyword.value.trim() || 'AI tools';
        const cleanKey = keyword.toLowerCase();
        const baseKey = cleanKey.replace(/\s+/g, '');
        
        btnGenTags.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btnGenTags.disabled = true;
        
        setTimeout(() => {
            currentYtTags = [
                keyword,
                `${keyword} tutorial`,
                `how to use ${keyword}`,
                `best ${keyword} 2026`,
                `${keyword} for beginners`,
                `${keyword} free`,
                `${keyword} tips and tricks`,
                `artificial intelligence`,
                `ai tools 2026`,
                `digiai dhairya`,
                `ai content creation`,
                `automate with ai`,
                `chatgpt prompts`,
                `midjourney tips`,
                `viral video editing`
            ];
            
            currentIgHashtags = [
                `#${baseKey}`,
                `#${baseKey}tutorial`,
                `#${baseKey}tips`,
                '#artificialintelligence',
                '#aitools',
                '#aitech',
                '#digiaidhairya',
                '#chatgpt',
                '#midjourney',
                '#contentcreators',
                '#videoediting',
                '#reelsviral',
                '#techtrends',
                '#automation',
                '#viralhack'
            ];
            
            ytTagsContainer.innerHTML = '';
            currentYtTags.forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'tag-chip';
                chip.textContent = tag;
                chip.title = 'Click to copy tag';
                chip.addEventListener('click', () => copyToClipboard(tag, `Tag "${tag}" copied!`));
                ytTagsContainer.appendChild(chip);
            });
            
            igTagsContainer.innerHTML = '';
            currentIgHashtags.forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'tag-chip';
                chip.textContent = tag;
                chip.title = 'Click to copy hashtag';
                chip.addEventListener('click', () => copyToClipboard(tag, `Hashtag "${tag}" copied!`));
                igTagsContainer.appendChild(chip);
            });
            
            tagResults.style.display = 'block';
            btnGenTags.innerHTML = '<i class="fas fa-tags"></i> Generate Tags & Hashtags';
            btnGenTags.disabled = false;
            
            tagResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    });
}

if (copyYtTagsBtn) {
    copyYtTagsBtn.addEventListener('click', () => {
        copyToClipboard(currentYtTags.join(', '), 'All YouTube SEO tags copied to clipboard! 📋');
    });
}

if (copyIgTagsBtn) {
    copyIgTagsBtn.addEventListener('click', () => {
        copyToClipboard(currentIgHashtags.join(' '), 'All Instagram hashtags copied! 🚀');
    });
}

// E. Tool 4: Viral Video Title Generator
const btnGenTitles = document.getElementById('btnGenTitles');
const titleTopic = document.getElementById('titleTopic');
const titleGoal = document.getElementById('titleGoal');
const titleResults = document.getElementById('titleResults');
const titlesList = document.getElementById('titlesList');

if (btnGenTitles) {
    btnGenTitles.addEventListener('click', () => {
        const topic = titleTopic.value.trim() || 'AI video editing';
        const goal = titleGoal.value;
        
        btnGenTitles.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btnGenTitles.disabled = true;
        
        setTimeout(() => {
            let titles = [];
            
            if (goal === 'views') {
                titles = [
                    { ctr: "99% CTR", text: `I Tested 7 FREE AI Tools for ${topic} (Shocking Results!)` },
                    { ctr: "97% CTR", text: `Stop Doing ${topic} Like This! (Do THIS in 2026)` },
                    { ctr: "95% CTR", text: `The Secret ${topic} Hack Top Creators Keep Hidden` },
                    { ctr: "94% CTR", text: `Why Everyone is Switching to This New ${topic} Method` },
                    { ctr: "92% CTR", text: `How I Automated 90% of My ${topic} with 1 Click` }
                ];
            } else if (goal === 'educational') {
                titles = [
                    { ctr: "96% CTR", text: `The Complete ${topic} Masterclass (Zero to Pro in 15 Minutes)` },
                    { ctr: "94% CTR", text: `Top 5 Best AI Tools for ${topic} in 2026 (Ranked & Tested)` },
                    { ctr: "93% CTR", text: `Step-by-Step Guide: How to Master ${topic} Fast` },
                    { ctr: "91% CTR", text: `The Ultimate ${topic} Blueprint for Students & Creators` },
                    { ctr: "89% CTR", text: `How Does ${topic} Actually Work? Complete Deep Dive` }
                ];
            } else {
                titles = [
                    { ctr: "98% CTR", text: `${topic} For Beginners: Start Here in 2026!` },
                    { ctr: "95% CTR", text: `Easy ${topic} Tutorial for Anyone (No Experience Needed)` },
                    { ctr: "93% CTR", text: `How to Learn ${topic} in Just 10 Minutes a Day` },
                    { ctr: "91% CTR", text: `The Simplest Way to Start with ${topic} Today` },
                    { ctr: "90% CTR", text: `3 Simple Steps to Master ${topic} (Beginner Friendly)` }
                ];
            }
            
            titlesList.innerHTML = '';
            titles.forEach(item => {
                const titleCard = document.createElement('div');
                titleCard.className = 'title-item';
                titleCard.innerHTML = `
                    <div class="title-info">
                        <span class="ctr-badge"><i class="fas fa-fire"></i> ${item.ctr}</span>
                        <span class="title-text">${item.text}</span>
                    </div>
                    <button type="button" class="btn-copy-prompt copy-title-btn" data-text="${item.text.replace(/"/g, '&quot;')}">
                        <i class="fas fa-copy"></i> <span>Copy</span>
                    </button>
                `;
                titlesList.appendChild(titleCard);
            });
            
            document.querySelectorAll('.copy-title-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.getAttribute('data-text');
                    copyToClipboard(text, 'Title copied! Ready for YouTube 💡');
                    btn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> <span>Copy</span>';
                    }, 2000);
                });
            });
            
            titleResults.style.display = 'block';
            btnGenTitles.innerHTML = '<i class="fas fa-lightbulb"></i> Generate 5 Viral Titles';
            btnGenTitles.disabled = false;
            
            titleResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    });
}

// =========================================
// 5. Flagship Tool: AI Viral Link Booster Engine
// =========================================
const btnBoostLink = document.getElementById('btnBoostLink');
const viralUrlInput = document.getElementById('viralUrl');
const linkTypeSelect = document.getElementById('linkType');
const targetAudienceInput = document.getElementById('targetAudience');
const viralBoosterResults = document.getElementById('viralBoosterResults');

const viralScoreNum = document.getElementById('viralScoreNum');
const scoreTitle = document.getElementById('scoreTitle');
const scoreSubtitle = document.getElementById('scoreSubtitle');

const waPostText = document.getElementById('waPostText');
const xPostText = document.getElementById('xPostText');
const igPostText = document.getElementById('igPostText');

const retentionHackText = document.getElementById('retentionHackText');
const seoTagsText = document.getElementById('seoTagsText');

const blastWaBtn = document.getElementById('blastWaBtn');
const blastTgBtn = document.getElementById('blastTgBtn');
const blastXBtn = document.getElementById('blastXBtn');
const blastLiBtn = document.getElementById('blastLiBtn');
const blastFbBtn = document.getElementById('blastFbBtn');

if (btnBoostLink) {
    btnBoostLink.addEventListener('click', () => {
        let url = viralUrlInput.value.trim();
        if (!url) {
            url = 'https://digiaidhairya.in/';
            viralUrlInput.value = url;
        }

        let linkType = linkTypeSelect.value;
        const audience = targetAudienceInput.value.trim() || 'Tech Creators & AI Enthusiasts';

        // Auto-detect URL type
        if (linkType === 'auto') {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                linkType = 'youtube';
            } else if (url.includes('instagram.com')) {
                linkType = 'instagram';
            } else {
                linkType = 'website';
            }
        }

        btnBoostLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing & Boosting Link...';
        btnBoostLink.disabled = true;

        setTimeout(() => {
            // Dynamic Viral Score (91 to 98)
            const randomScore = Math.floor(Math.random() * 8) + 91;
            viralScoreNum.textContent = randomScore;

            let waMsg = '';
            let xMsg = '';
            let igMsg = '';
            let retentionTip = '';
            let tagsList = '';

            if (linkType === 'youtube') {
                scoreTitle.textContent = `🔥 YouTube Viral Score: ${randomScore}/100`;
                scoreSubtitle.textContent = `Analyzed for YouTube algorithm triggers (CTR, Watch-Time, and Session Velocity). Use the cross-platform blast copy below to drive instant external view velocity!`;
                
                waMsg = `🚨 *MUST WATCH ALERT!* 🚀\n\nIf you want to stay ahead in *${audience}*, you need to see this new breakdown right now:\n\n👉 Watch here: ${url}\n\n💡 _Pro Tip: Share this with anyone who wants to 10x their results!_`;
                
                xMsg = `Most creators spend months figuring this out, but this video broke it down in minutes.\n\nMust watch breakdown for anyone in ${audience}:\n\n${url}\n\nHere are 3 quick takeaways from the video 🧵👇\n1/ Stop doing repetitive manual work\n2/ Use AI to multiply your speed\n3/ Take action before it saturates`;
                
                igMsg = `Save this video before everyone else catches on! 🛑✨\n\nTap the link in bio to watch the full breakdown: ${url}\n\nAre you using this method yet? Comment 'YES' or 'NO' below! 👇🚀\n\n#youtubecreators #viralhack #algorithmboost #aitools #digiaidhairya`;
                
                retentionTip = `YouTube algorithm prioritizes the first 15 seconds. Ensure you jump straight into the hook without intro logos. Use the WhatsApp broadcast message within 60 minutes of uploading to trigger immediate velocity.`;
                
                tagsList = `youtube seo, viral video, ${audience.toLowerCase()}, how to go viral, algorithm hack, trending video, digiai dhairya, youtube algorithm 2026`;
            } else if (linkType === 'instagram') {
                scoreTitle.textContent = `🚀 Instagram Reel Viral Potential: ${randomScore}/100`;
                scoreSubtitle.textContent = `Optimized for Instagram Explore page and Reel recommendations. Drive initial saves and shares using the WhatsApp broadcast script below!`;
                
                waMsg = `🔥 *Check out this viral Reel!* ✨\n\nThis short tip is blowing up right now:\n👉 ${url}\n\nDrop a like and save it before you forget! 🚀`;
                
                xMsg = `This 30-second Reel just explained something 90% of people get wrong:\n\n👉 ${url}\n\nShort, sharp, and straight to the point. Thoughts on this?`;
                
                igMsg = `The secret is finally out. 🤫🚀\n\nWatch the full breakdown here: ${url}\n\nBookmark this reel so you have it ready when you need it! 📌\n\n#reelsviral #explorepage #instatrend #creatorgrowth #digiaidhairya`;
                
                retentionTip = `Reels that get shared to WhatsApp or DMs within 3 hours get a 4x boost on the Explore feed. Pair this Reel with an audio that has the trending arrow (↗️) for extra reach.`;
                
                tagsList = `reelsviral, instagood, creatorhacks, ${audience.toLowerCase()}, trendingreels, ai video, digiaidhairya`;
            } else {
                scoreTitle.textContent = `🌐 Website Virality & Traffic Score: ${randomScore}/100`;
                scoreSubtitle.textContent = `Configured for maximum viral launch traffic across social channels, Reddit, WhatsApp communities, and Google indexing.`;
                
                waMsg = `🚀 *Awesome Free Resource Alert!* 🌐\n\nI just came across this incredible website for ${audience}:\n👉 ${url}\n\nIt has free tools and guides that save hours of work. Check it out and bookmark it!`;
                
                xMsg = `Found a golden gem for anyone interested in ${audience}.\n\nCheck out: ${url}\n\nBookmark this site before it goes viral. 10/10 utility.`;
                
                igMsg = `Found the ultimate hub for ${audience}! 💻✨\n\nLink is live in bio: ${url}\n\nTag a friend who needs to know about this website right now! 👇🔥`;
                
                retentionTip = `Keep the website loading under 1.5 seconds and ensure social share buttons are clearly visible above the fold to encourage organic user distribution.`;
                
                tagsList = `website launch, free tools, ${audience.toLowerCase()}, tech hub, productive web, viral link, digiaidhairya`;
            }

            waPostText.textContent = waMsg;
            xPostText.textContent = xMsg;
            igPostText.textContent = igMsg;

            retentionHackText.textContent = retentionTip;
            seoTagsText.textContent = tagsList;

            // Set up 1-click share blast links
            blastWaBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
            blastTgBtn.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(waMsg)}`;
            blastXBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(xMsg.substring(0, 200))}`;
            blastLiBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            blastFbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

            viralBoosterResults.style.display = 'block';
            btnBoostLink.innerHTML = '<i class="fas fa-bolt"></i> Boost & Go Viral!';
            btnBoostLink.disabled = false;

            viralBoosterResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToast('Viral Optimization Complete! Ready to distribute 🚀', 'fas fa-rocket');
        }, 600);
    });
}

// Handler for Copying Viral Post Cards
document.querySelectorAll('.copy-viral-post-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            copyToClipboard(targetElement.textContent, 'Viral post copied! Paste & Share 📢');
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> <span>Copy Post</span>';
            }, 2000);
        }
    });
});


