document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Consolidated scroll handler (single listener) ──
    const progressBar = document.querySelector(".scroll-progress");
    const backToTop = document.querySelector(".back-to-top");
    let scrollTicking = false;

    const onScroll = () => {
        scrollTicking = false;
        const scrollY = window.scrollY;
        // Header state
        if (header) header.classList.toggle("is-scrolled", scrollY > 24);
        // Scroll progress bar
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = docHeight > 0 ? `${(scrollY / docHeight) * 100}%` : "0%";
        }
        // Back to top
        if (backToTop) backToTop.classList.toggle("is-visible", scrollY > 500);
    };

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    }, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ── Mobile menu toggle ──
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            menu.classList.toggle("is-open", !expanded);
            const icon = toggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars", expanded);
                icon.classList.toggle("fa-xmark", !expanded);
            }
        });
        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
                const icon = toggle.querySelector("i");
                if (icon) {
                    icon.classList.add("fa-bars");
                    icon.classList.remove("fa-xmark");
                }
            });
        });
    }

    // ── Dynamic year ──
    document.querySelectorAll("[data-year]").forEach((node) => {
        node.textContent = String(new Date().getFullYear());
    });

    // ── WhatsApp form ──
    const form = document.querySelector("[data-quote-form]");
    if (form) {
        const helper = document.querySelector("[data-form-feedback]");
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = new FormData(form);
            const name = (data.get("name") || "").toString().trim();
            const phone = (data.get("phone") || "").toString().trim();
            const service = (data.get("service") || "").toString().trim();
            const message = (data.get("message") || "").toString().trim();
            const text = [
                "Merhaba, keşif / bilgi talebi bırakmak istiyorum.",
                name ? `İsim: ${name}` : "",
                phone ? `Telefon: ${phone}` : "",
                service ? `Hizmet konusu: ${service}` : "",
                message ? `Detay: ${message}` : ""
            ].filter(Boolean).join("\n");
            if (helper) {
                helper.textContent = "Talebiniz WhatsApp üzerinden hazırlandı. Yeni sekmede açılıyor.";
            }
            window.open(`https://wa.me/905016483446?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
        });
    }

    // ── Counter animation ──
    const formatCounterValue = (value) =>
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(value));

    const startCounter = (node) => {
        if (!node || node.dataset.counted === "true") return;
        const target = Number(node.dataset.target || 0);
        const duration = Number(node.dataset.duration || 1500);
        node.dataset.counted = "true";
        if (prefersReducedMotion || typeof window.requestAnimationFrame !== "function") {
            node.textContent = formatCounterValue(target);
            return;
        }
        const startTime = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            node.textContent = formatCounterValue(target * eased);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                node.textContent = formatCounterValue(target);
            }
        };
        requestAnimationFrame(tick);
    };

    // ── Unified IntersectionObserver for all reveals ──
    const revealTargets = document.querySelectorAll(
        ".section-head, .hero-counter, .trust-card, .service-card, .timeline-card, .gallery-card, .testimonial-card, .faq-card, .story-card, .story-media, .signal-card, .principle-card, .metric-card, .region-card, .service-group, .showcase-card, .contact-card, .contact-panel, .form-panel, .map-card, .cta-band, .dark-panel, .page-hero-card"
    );
    const newRevealTargets = document.querySelectorAll(
        ".reveal-slide-left, .reveal-slide-right, .reveal-scale, .reveal-rotate, .clip-reveal"
    );

    if ("IntersectionObserver" in window) {
        // Single observer for all reveal elements
        const revealObserver = new IntersectionObserver(
            (entries) => {
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        entries[i].target.classList.add("is-visible");
                        revealObserver.unobserve(entries[i].target);
                    }
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealTargets.forEach((el, i) => {
            el.classList.add("reveal");
            el.style.setProperty("--reveal-delay", `${Math.min(i * 35, 220)}ms`);
            revealObserver.observe(el);
        });

        newRevealTargets.forEach((el, i) => {
            el.style.setProperty("--reveal-delay", `${Math.min(i * 60, 300)}ms`);
            revealObserver.observe(el);
        });

        // Counter observer
        const counterNodes = document.querySelectorAll("[data-counter]");
        if (counterNodes.length > 0) {
            const counterObserver = new IntersectionObserver(
                (entries) => {
                    for (let i = 0; i < entries.length; i++) {
                        if (entries[i].isIntersecting) {
                            startCounter(entries[i].target);
                            counterObserver.unobserve(entries[i].target);
                        }
                    }
                },
                { threshold: 0.5 }
            );
            counterNodes.forEach((node) => counterObserver.observe(node));
        }
    } else {
        document.querySelectorAll("[data-counter]").forEach((node) => startCounter(node));
    }

    // ── Word-by-word reveal ──
    document.querySelectorAll(".word-reveal").forEach((el) => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words
            .map((word, i) => `<span class="word" style="transition-delay:${i * 60}ms">${word}</span>`)
            .join(" ");
    });

    const wordObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.classList.add("is-visible");
                wordObserver.unobserve(entries[i].target);
            }
        }
    }, { threshold: 0.3 });
    document.querySelectorAll(".word-reveal").forEach((el) => wordObserver.observe(el));

    // ════════════════════════════════════
    // CREATIVE INTERACTIVE ANIMATIONS
    // ════════════════════════════════════

    if (prefersReducedMotion) return;

    // ── 3D Tilt Card Effect (desktop only, throttled) ──
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
        document.querySelectorAll(".tilt-card").forEach((card) => {
            let tiltRAF = null;
            card.addEventListener("mousemove", (e) => {
                if (tiltRAF) return;
                tiltRAF = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
                    const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    tiltRAF = null;
                });
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });

        // ── Magnetic Button Effect (desktop only, throttled) ──
        document.querySelectorAll(".btn-magnetic").forEach((btn) => {
            let magRAF = null;
            btn.addEventListener("mousemove", (e) => {
                if (magRAF) return;
                magRAF = requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                    magRAF = null;
                });
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "";
            });
        });
    }

    // ── Ripple Effect on Buttons ──
    document.querySelectorAll(".btn-ripple").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            const rect = this.getBoundingClientRect();
            const circle = document.createElement("span");
            const size = Math.max(rect.width, rect.height);
            circle.classList.add("ripple-circle");
            circle.style.width = circle.style.height = `${size}px`;
            circle.style.left = `${e.clientX - rect.left - size / 2}px`;
            circle.style.top = `${e.clientY - rect.top - size / 2}px`;
            this.appendChild(circle);
            circle.addEventListener("animationend", () => circle.remove());
        });
    });

    // ── Floating Particle Field (reduced count) ──
    const particleField = document.querySelector(".particle-field");
    if (particleField && !isMobile) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement("div");
            dot.classList.add("particle");
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.setProperty("--duration", `${14 + Math.random() * 12}s`);
            dot.style.setProperty("--delay", `${Math.random() * 6}s`);
            dot.style.setProperty("--tx1", `${-20 + Math.random() * 40}px`);
            dot.style.setProperty("--ty1", `${-30 + Math.random() * 30}px`);
            dot.style.setProperty("--tx2", `${-30 + Math.random() * 60}px`);
            dot.style.setProperty("--ty2", `${-60 + Math.random() * 40}px`);
            dot.style.setProperty("--tx3", `${-15 + Math.random() * 30}px`);
            dot.style.setProperty("--ty3", `${-25 + Math.random() * 20}px`);
            dot.style.width = `${3 + Math.random() * 3}px`;
            dot.style.height = dot.style.width;
            particleField.appendChild(dot);
        }
    }

    // ── FAQ smooth accordion ──
    document.querySelectorAll(".faq-card").forEach((faq) => {
        const summary = faq.querySelector("summary");
        if (!summary) return;
        summary.addEventListener("click", (e) => {
            e.preventDefault();
            if (faq.hasAttribute("open")) {
                const answer = faq.querySelector(".faq-answer");
                if (answer) {
                    answer.style.gridTemplateRows = "0fr";
                    answer.style.opacity = "0";
                    setTimeout(() => {
                        faq.removeAttribute("open");
                        answer.style.gridTemplateRows = "";
                        answer.style.opacity = "";
                    }, 350);
                } else {
                    faq.removeAttribute("open");
                }
            } else {
                faq.setAttribute("open", "");
            }
        });
    });

    // ── Typewriter effect ──
    const typewriterEls = document.querySelectorAll("[data-typewriter]");
    typewriterEls.forEach((el) => {
        const text = el.textContent;
        el.textContent = "";
        el.classList.add("typewriter-cursor");
        let i = 0;
        const speed = Number(el.dataset.typewriter || 45);
        const typeNextChar = () => {
            if (i < text.length) {
                el.textContent += text[i];
                i++;
                setTimeout(typeNextChar, speed);
            } else {
                setTimeout(() => el.classList.remove("typewriter-cursor"), 1500);
            }
        };
        const typeObserver = new IntersectionObserver((entries) => {
            for (let j = 0; j < entries.length; j++) {
                if (entries[j].isIntersecting) {
                    typeNextChar();
                    typeObserver.unobserve(entries[j].target);
                }
            }
        }, { threshold: 0.5 });
        typeObserver.observe(el);
    });

    // ── KVKK Cookie Consent Banner ──
    const cookieBanner = document.createElement("div");
    cookieBanner.className = "cookie-banner";
    cookieBanner.innerHTML = `
        <div class="cookie-content">
            <p>Sizlere daha iyi hizmet sunabilmek için sitemizde çerezler kullanılmaktadır. Detaylı bilgi için <a href="gizlilik-politikasi.html">Gizlilik ve Çerez Politikamızı</a> inceleyebilirsiniz.</p>
            <div class="cookie-actions">
                <button class="btn btn-primary btn-sm btn-ripple" id="accept-cookies">Kabul Et</button>
            </div>
        </div>
    `;
    
    if (!localStorage.getItem("cookies_accepted")) {
        document.body.appendChild(cookieBanner);
        setTimeout(() => cookieBanner.classList.add("is-visible"), 100);
    }

    document.body.addEventListener("click", (e) => {
        if (e.target.id === "accept-cookies") {
            localStorage.setItem("cookies_accepted", "true");
            cookieBanner.classList.remove("is-visible");
            setTimeout(() => cookieBanner.remove(), 400);
        }
    });
});
