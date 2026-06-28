/*
 * Contact form — powered by FormSubmit.co
 *
 * First submission triggers a verification email to v2archdesign2015@gmail.com.
 * Click the link in that email once to activate. All future submissions are
 * delivered directly to that inbox.
 */

document.addEventListener('DOMContentLoaded', function () {
    var form      = document.querySelector('form.contact-form');
    var notice    = document.getElementById('formNotice');
    var submitBtn = document.getElementById('submitBtn');
    if (!form) return;

    /* ── Helpers ─────────────────────────────────────────────── */
    function showNotice(msg, type) {
        if (!notice) return;
        notice.innerHTML     = msg;
        notice.className     = 'form-notice ' + type;
        notice.style.display = 'block';
        notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (type === 'success') {
            setTimeout(function () { notice.style.display = 'none'; }, 8000);
        }
    }

    function setLoading(on) {
        if (!submitBtn) return;
        submitBtn.disabled  = on;
        submitBtn.innerHTML = on
            ? 'Sending… &nbsp;<i class="fa fa-spinner fa-spin"></i>'
            : 'Send Message &nbsp;<i class="fa fa-paper-plane-o"></i>';
    }

    function clearFieldError(input) {
        input.classList.remove('field-error');
        var msg = input.parentNode.querySelector('.field-error-msg');
        if (msg) msg.remove();
    }

    function setFieldError(input, msg) {
        input.classList.add('field-error');
        if (!input.parentNode.querySelector('.field-error-msg')) {
            var span = document.createElement('span');
            span.className   = 'field-error-msg';
            span.textContent = msg;
            input.parentNode.appendChild(span);
        }
    }

    /* Clear error highlight when user starts typing */
    form.querySelectorAll('input, textarea').forEach(function (el) {
        el.addEventListener('input', function () { clearFieldError(el); });
    });

    /* ── Submit ──────────────────────────────────────────────── */
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (notice) notice.style.display = 'none';

        var nameEl    = form.querySelector('input[name="name"]');
        var emailEl   = form.querySelector('input[name="email"]');
        var websiteEl = form.querySelector('input[name="website"]');
        var msgEl     = form.querySelector('textarea[name="message"]');

        var name    = (nameEl.value    || '').trim();
        var email   = (emailEl.value   || '').trim();
        var website = (websiteEl ? websiteEl.value || '' : '').trim();
        var message = (msgEl.value     || '').trim();

        /* ── Validate ──────────────────────────────────────── */
        var valid = true;

        clearFieldError(nameEl);
        clearFieldError(emailEl);
        clearFieldError(msgEl);

        if (!name) {
            setFieldError(nameEl, 'Please enter your name.');
            valid = false;
        }
        if (!email) {
            setFieldError(emailEl, 'Please enter your email address.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError(emailEl, 'Please enter a valid email address.');
            valid = false;
        }
        if (!message) {
            setFieldError(msgEl, 'Please tell us about your project.');
            valid = false;
        }

        if (!valid) {
            /* Scroll to first error */
            var firstErr = form.querySelector('.field-error');
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        /* ── Send ────────────────────────────────────────── */
        setLoading(true);

        fetch('https://formsubmit.co/ajax/v2archdesign2015@gmail.com', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name:      name,
                email:     email,
                website:   website || '(not provided)',
                message:   message,
                _subject:  'New Enquiry — ' + name + ' | v2archdesign',
                _template: 'table',
                _captcha:  'false'
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success === 'true' || data.success === true) {
                /* Use textContent for name to prevent XSS */
                var msg = document.createElement('span');
                msg.textContent = name;
                showNotice(
                    '&#10003; Thank you, <strong>' + msg.innerHTML + '</strong>! Your message has been sent. We will get back to you soon.',
                    'success'
                );
                form.reset();
            } else {
                /* FormSubmit returns success:false until the activation email
                   sent to v2archdesign2015@gmail.com is clicked once. */
                var apiMsg = data.message ? String(data.message).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
                showNotice(
                    (apiMsg ? apiMsg + '<br><br>' : '') +
                    'If this is the first time using this form, please check <strong>v2archdesign2015@gmail.com</strong> inbox for a FormSubmit activation email and click the link inside. After that, the form will work permanently.',
                    'error'
                );
            }
        })
        .catch(function () {
            showNotice('Network error. Please email us at <a href="mailto:v2archdesign2015@gmail.com">v2archdesign2015@gmail.com</a>', 'error');
        })
        .finally(function () {
            setLoading(false);
        });
    });
});
