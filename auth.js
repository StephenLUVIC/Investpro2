// Authentication Form Handler
class AuthForm {
    constructor() {
        this.isLogin = true;
        this.isLoading = false;
        this.form = document.getElementById('auth-form');
        this.initializeElements();
        this.bindEvents();
        this.animateFormLoad();
    }

    initializeElements() {
        // Form elements
        this.formTitle = document.getElementById('form-title');
        this.formSubtitle = document.getElementById('form-subtitle');
        this.nameFields = document.getElementById('name-fields');
        this.confirmPasswordField = document.getElementById('confirm-password-field');
        this.loginOptions = document.getElementById('login-options');
        this.submitBtn = document.getElementById('submit-btn');
        this.toggleText = document.getElementById('toggle-text');
        this.toggleBtn = document.getElementById('toggle-mode');
        this.passwordToggle = document.getElementById('password-toggle');
        
        // Input fields
        this.inputs = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword')
        };
        
        // Error containers
        this.errorContainers = {
            firstName: document.getElementById('firstName-error'),
            lastName: document.getElementById('lastName-error'),
            email: document.getElementById('email-error'),
            password: document.getElementById('password-error'),
            confirmPassword: document.getElementById('confirmPassword-error')
        };
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Toggle between login/signup
        this.toggleBtn.addEventListener('click', () => this.toggleMode());
        
        // Password visibility toggle
        this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Input validation on blur
        Object.keys(this.inputs).forEach(key => {
            if (this.inputs[key]) {
                this.inputs[key].addEventListener('blur', () => this.validateField(key));
                this.inputs[key].addEventListener('input', () => this.clearError(key));
            }
        });
        
        // Forgot password
        const forgotPassword = document.querySelector('.forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', () => this.handleForgotPassword());
        }
    }

    animateFormLoad() {
        // Add staggered animation to form elements
        const elements = this.form.querySelectorAll('.input-group, .login-options, .submit-btn');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }

    toggleMode() {
        this.isLogin = !this.isLogin;
        this.clearAllErrors();
        this.resetForm();
        
        // Animate transition
        this.animateTransition();
        
        // Update UI
        setTimeout(() => {
            this.updateFormContent();
        }, 150);
    }

    animateTransition() {
        // Fade out current content
        const animatedElements = [
            this.formTitle,
            this.formSubtitle,
            this.nameFields,
            this.confirmPasswordField,
            this.loginOptions,
            this.submitBtn,
            this.toggleText
        ];
        
        animatedElements.forEach(element => {
            if (element) {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '0.5';
                element.style.transform = 'translateX(-10px)';
            }
        });
        
        // Fade back in
        setTimeout(() => {
            animatedElements.forEach(element => {
                if (element) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                }
            });
        }, 300);
    }

    updateFormContent() {
        if (this.isLogin) {
            // Login mode
            this.formTitle.textContent = 'Welcome back';
            this.formSubtitle.textContent = 'Sign in to your account';
            this.nameFields.classList.add('hidden');
            this.confirmPasswordField.classList.add('hidden');
            this.loginOptions.classList.remove('hidden');
            this.submitBtn.querySelector('.btn-text').textContent = 'Sign In';
            this.toggleText.textContent = "Don't have an account?";
            this.toggleBtn.textContent = 'Sign up';
        } else {
            // Signup mode
            this.formTitle.textContent = 'Create account';
            this.formSubtitle.textContent = 'Join thousands of users worldwide';
            this.nameFields.classList.remove('hidden');
            this.confirmPasswordField.classList.remove('hidden');
            this.loginOptions.classList.add('hidden');
            this.submitBtn.querySelector('.btn-text').textContent = 'Create Account';
            this.toggleText.textContent = 'Already have an account?';
            this.toggleBtn.textContent = 'Sign in';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = this.inputs.password;
        const confirmPasswordInput = this.inputs.confirmPassword;
        const eyeIcon = this.passwordToggle.querySelector('.eye-icon');
        const eyeOffIcon = this.passwordToggle.querySelector('.eye-off-icon');
        
        const isPassword = passwordInput.type === 'password';
        
        // Toggle password visibility
        passwordInput.type = isPassword ? 'text' : 'password';
        if (confirmPasswordInput) {
            confirmPasswordInput.type = isPassword ? 'text' : 'password';
        }
        
        // Toggle icons
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
        
        // Add animation
        this.passwordToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.passwordToggle.style.transform = 'scale(1)';
        }, 100);
    }

    validateField(fieldName) {
        const input = this.inputs[fieldName];
        const value = input.value.trim();
        let error = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!this.isLogin && !value) {
                    error = `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
                
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
                
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                } else if (!this.isStrongPassword(value)) {
                    error = 'Password must contain letters and numbers';
                }
                break;
                
            case 'confirmPassword':
                if (!this.isLogin) {
                    if (!value) {
                        error = 'Please confirm your password';
                    } else if (value !== this.inputs.password.value) {
                        error = 'Passwords do not match';
                    }
                }
                break;
        }

        this.showError(fieldName, error);
        return !error;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isStrongPassword(password) {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasLetter && hasNumber;
    }

    showError(fieldName, message) {
        const input = this.inputs[fieldName];
        const errorContainer = this.errorContainers[fieldName];
        
        if (message) {
            input.classList.add('error');
            errorContainer.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                ${message}
            `;
            errorContainer.classList.add('show');
        } else {
            input.classList.remove('error');
            errorContainer.classList.remove('show');
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 300);
        }
    }

    clearError(fieldName) {
        this.showError(fieldName, '');
    }

    clearAllErrors() {
        Object.keys(this.inputs).forEach(fieldName => {
            this.clearError(fieldName);
        });
    }

    validateForm() {
        let isValid = true;
        
        // Validate email and password for both modes
        isValid = this.validateField('email') && isValid;
        isValid = this.validateField('password') && isValid;
        
        // Additional validation for signup mode
        if (!this.isLogin) {
            isValid = this.validateField('firstName') && isValid;
            isValid = this.validateField('lastName') && isValid;
            isValid = this.validateField('confirmPassword') && isValid;
        }
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Validate form
        if (!this.validateForm()) {
            this.shakeForm();
            return;
        }
        
        // Start loading
        this.setLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Success animation
            this.showSuccess();
            
            // Redirect after success
            setTimeout(() => {
                this.redirectToApp();
            }, 1500);
            
        } catch (error) {
            this.showError('email', 'Authentication failed. Please try again.');
            this.shakeForm();
        } finally {
            this.setLoading(false);
        }
    }

    async simulateApiCall() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) { // 90% success rate
            return { success: true };
        } else {
            throw new Error('Authentication failed');
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnIcon = this.submitBtn.querySelector('.btn-icon');
        const loadingSpinner = this.submitBtn.querySelector('.loading-spinner');
        
        if (loading) {
            btnText.style.opacity = '0';
            btnIcon.style.opacity = '0';
            loadingSpinner.classList.remove('hidden');
            this.submitBtn.disabled = true;
        } else {
            btnText.style.opacity = '1';
            btnIcon.style.opacity = '1';
            loadingSpinner.classList.add('hidden');
            this.submitBtn.disabled = false;
        }
    }

    showSuccess() {
        // Change button to success state
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnIcon = this.submitBtn.querySelector('.btn-icon');
        
        btnText.textContent = 'Success!';
        btnIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
            </svg>
        `;
        
        // Add success animation
        this.submitBtn.style.background = '#10B981';
        this.submitBtn.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            this.submitBtn.style.transform = 'scale(1)';
        }, 200);
    }

    shakeForm() {
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
    }

    resetForm() {
        this.form.reset();
        this.clearAllErrors();
    }

    handleForgotPassword() {
        alert('Password reset functionality would be implemented here. For demo purposes, this shows an alert.');
    }

    redirectToApp() {
        // In a real application, you would redirect to the main app
        alert('Authentication successful! In a real app, you would be redirected to the home.');
        
        // For demo purposes, reload the page
        
        window.location.href = "test.html";
    }
}

// Add shake animation CSS
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Inject shake animation
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthForm();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add floating animation to background elements
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 2}s`;
    });
    
    // Add parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
    
    // Add focus animations to inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});