// SUPER SIMPLE WORKING AVATAR
console.log('✅ Avatar script loaded!');

// Create avatar immediately when script loads
(function() {
    console.log('🚀 Initializing avatar system...');
    
    // Make functions globally available
    window.initAvatar = function(containerId) {
        console.log('✅ initAvatar called with:', containerId);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container not found');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        container.style.backgroundColor = '#1a1a2e';
        container.style.borderRadius = '10px';
        container.style.padding = '20px';
        container.style.position = 'relative';
        container.style.height = '400px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        
        // Create avatar display
        const avatarDisplay = document.createElement('div');
        avatarDisplay.id = 'avatar-display';
        avatarDisplay.style.width = '200px';
        avatarDisplay.style.height = '200px';
        avatarDisplay.style.position = 'relative';
        avatarDisplay.style.margin = '0 auto';
        
        // Create head
        const head = document.createElement('div');
        head.id = 'avatar-head';
        head.style.width = '80px';
        head.style.height = '80px';
        head.style.backgroundColor = '#ffaa88';
        head.style.borderRadius = '50%';
        head.style.position = 'absolute';
        head.style.top = '0';
        head.style.left = '60px';
        head.style.boxShadow = '0 0 20px rgba(255,170,136,0.5)';
        head.style.transition = 'all 0.3s ease';
        
        // Eyes
        const leftEye = document.createElement('div');
        leftEye.style.width = '15px';
        leftEye.style.height = '15px';
        leftEye.style.backgroundColor = 'white';
        leftEye.style.borderRadius = '50%';
        leftEye.style.position = 'absolute';
        leftEye.style.top = '25px';
        leftEye.style.left = '15px';
        leftEye.style.boxShadow = '0 0 5px white';
        
        const rightEye = document.createElement('div');
        rightEye.style.width = '15px';
        rightEye.style.height = '15px';
        rightEye.style.backgroundColor = 'white';
        rightEye.style.borderRadius = '50%';
        rightEye.style.position = 'absolute';
        rightEye.style.top = '25px';
        rightEye.style.right = '15px';
        rightEye.style.boxShadow = '0 0 5px white';
        
        // Pupils
        const leftPupil = document.createElement('div');
        leftPupil.style.width = '7px';
        leftPupil.style.height = '7px';
        leftPupil.style.backgroundColor = 'black';
        leftPupil.style.borderRadius = '50%';
        leftPupil.style.position = 'absolute';
        leftPupil.style.top = '29px';
        leftPupil.style.left = '19px';
        
        const rightPupil = document.createElement('div');
        rightPupil.style.width = '7px';
        rightPupil.style.height = '7px';
        rightPupil.style.backgroundColor = 'black';
        rightPupil.style.borderRadius = '50%';
        rightPupil.style.position = 'absolute';
        rightPupil.style.top = '29px';
        rightPupil.style.right = '19px';
        
        // Mouth
        const mouth = document.createElement('div');
        mouth.id = 'avatar-mouth';
        mouth.style.width = '30px';
        mouth.style.height = '15px';
        mouth.style.borderBottom = '3px solid white';
        mouth.style.borderRadius = '0 0 15px 15px';
        mouth.style.position = 'absolute';
        mouth.style.bottom = '15px';
        mouth.style.left = '25px';
        mouth.style.transition = 'all 0.3s ease';
        
        head.appendChild(leftEye);
        head.appendChild(rightEye);
        head.appendChild(leftPupil);
        head.appendChild(rightPupil);
        head.appendChild(mouth);
        
        // Body
        const body = document.createElement('div');
        body.id = 'avatar-body';
        body.style.width = '100px';
        body.style.height = '120px';
        body.style.backgroundColor = '#22c55e';
        body.style.borderRadius = '10px';
        body.style.position = 'absolute';
        body.style.top = '80px';
        body.style.left = '50px';
        body.style.boxShadow = '0 0 20px rgba(34,197,94,0.5)';
        body.style.transition = 'all 0.3s ease';
        
        // Left arm
        const leftArm = document.createElement('div');
        leftArm.id = 'left-arm';
        leftArm.style.width = '25px';
        leftArm.style.height = '70px';
        leftArm.style.backgroundColor = '#22c55e';
        leftArm.style.borderRadius = '10px';
        leftArm.style.position = 'absolute';
        leftArm.style.top = '90px';
        leftArm.style.left = '25px';
        leftArm.style.transformOrigin = 'top center';
        leftArm.style.transform = 'rotate(20deg)';
        leftArm.style.boxShadow = '0 0 10px rgba(34,197,94,0.5)';
        leftArm.style.transition = 'transform 0.3s ease';
        
        // Right arm
        const rightArm = document.createElement('div');
        rightArm.id = 'right-arm';
        rightArm.style.width = '25px';
        rightArm.style.height = '70px';
        rightArm.style.backgroundColor = '#22c55e';
        rightArm.style.borderRadius = '10px';
        rightArm.style.position = 'absolute';
        rightArm.style.top = '90px';
        rightArm.style.right = '25px';
        rightArm.style.transformOrigin = 'top center';
        rightArm.style.transform = 'rotate(-20deg)';
        rightArm.style.boxShadow = '0 0 10px rgba(34,197,94,0.5)';
        rightArm.style.transition = 'transform 0.3s ease';
        
        // Left leg
        const leftLeg = document.createElement('div');
        leftLeg.style.width = '25px';
        leftLeg.style.height = '60px';
        leftLeg.style.backgroundColor = '#1a4d1a';
        leftLeg.style.borderRadius = '5px';
        leftLeg.style.position = 'absolute';
        leftLeg.style.bottom = '0';
        leftLeg.style.left = '15px';
        
        // Right leg
        const rightLeg = document.createElement('div');
        rightLeg.style.width = '25px';
        rightLeg.style.height = '60px';
        rightLeg.style.backgroundColor = '#1a4d1a';
        rightLeg.style.borderRadius = '5px';
        rightLeg.style.position = 'absolute';
        rightLeg.style.bottom = '0';
        rightLeg.style.right = '15px';
        
        body.appendChild(leftLeg);
        body.appendChild(rightLeg);
        
        // Add everything to avatar display
        avatarDisplay.appendChild(head);
        avatarDisplay.appendChild(body);
        avatarDisplay.appendChild(leftArm);
        avatarDisplay.appendChild(rightArm);
        
        // Add to container
        container.appendChild(avatarDisplay);
        
        // Add status indicator
        const status = document.createElement('div');
        status.id = 'avatar-status-text';
        status.style.marginTop = '20px';
        status.style.color = '#22c55e';
        status.style.fontSize = '16px';
        status.style.fontWeight = 'bold';
        status.innerText = '✅ AVATAR READY';
        container.appendChild(status);
        
        // Store elements globally
        window.avatarElements = {
            head: head,
            leftArm: leftArm,
            rightArm: rightArm,
            mouth: mouth,
            body: body,
            status: status
        };
        
        console.log('✅ Avatar created successfully');
        
        // Start idle animation
        startIdleAnimation();
    };
    
    // Idle animation
    function startIdleAnimation() {
        let time = 0;
        setInterval(function() {
            if (!window.avatarElements) return;
            
            time += 0.1;
            
            // Gentle sway
            if (window.avatarElements.body) {
                window.avatarElements.body.style.transform = `rotate(${Math.sin(time) * 2}deg)`;
            }
            
            // Subtle arm movement
            if (window.avatarElements.leftArm) {
                window.avatarElements.leftArm.style.transform = `rotate(${20 + Math.sin(time) * 5}deg)`;
            }
            if (window.avatarElements.rightArm) {
                window.avatarElements.rightArm.style.transform = `rotate(${-20 + Math.cos(time) * 5}deg)`;
            }
            
            // Occasional blink
            if (Math.random() < 0.01) {
                blink();
            }
        }, 100);
    }
    
    // Blink function
    function blink() {
        if (!window.avatarElements) return;
        
        const eyes = window.avatarElements.head.querySelectorAll('div[style*="background-color: white"]');
        eyes.forEach(eye => {
            eye.style.height = '2px';
            eye.style.backgroundColor = '#ffaa88';
        });
        
        setTimeout(() => {
            eyes.forEach(eye => {
                eye.style.height = '15px';
                eye.style.backgroundColor = 'white';
            });
        }, 200);
    }
    
    // Function to play signs
    window.playSigns = function(words, callback) {
        console.log('🎬 Playing signs for:', words);
        
        if (!window.avatarElements) {
            console.error('Avatar not ready');
            if (callback) callback();
            return;
        }
        
        const status = window.avatarElements.status;
        if (status) status.innerText = '🤟 SIGNING...';
        
        let index = 0;
        
        function doNextSign() {
            if (index >= words.length) {
                console.log('✅ Done signing');
                if (status) status.innerText = '✅ AVATAR READY';
                if (callback) callback();
                return;
            }
            
            const word = words[index].toUpperCase();
            console.log(`👉 Signing: ${word}`);
            
            if (status) status.innerText = `🤟 ${word}`;
            
            // Animate based on word
            if (word === 'HELLO' || word === 'HI') {
                // Wave
                let waveCount = 0;
                const waveInterval = setInterval(() => {
                    if (waveCount >= 6) {
                        clearInterval(waveInterval);
                        window.avatarElements.rightArm.style.transform = 'rotate(-20deg)';
                        index++;
                        doNextSign();
                    } else {
                        const angle = waveCount % 2 === 0 ? 30 : -50;
                        window.avatarElements.rightArm.style.transform = `rotate(${angle}deg)`;
                        waveCount++;
                    }
                }, 300);
            }
            else if (word === 'GO') {
                // Point
                window.avatarElements.rightArm.style.transform = 'rotate(-80deg)';
                window.avatarElements.leftArm.style.transform = 'rotate(10deg)';
                setTimeout(() => {
                    window.avatarElements.rightArm.style.transform = 'rotate(-20deg)';
                    window.avatarElements.leftArm.style.transform = 'rotate(20deg)';
                    index++;
                    doNextSign();
                }, 1500);
            }
            else if (word === 'ME' || word === 'I') {
                // Point to self
                window.avatarElements.rightArm.style.transform = 'rotate(-120deg)';
                window.avatarElements.rightArm.style.left = '70px';
                setTimeout(() => {
                    window.avatarElements.rightArm.style.transform = 'rotate(-20deg)';
                    window.avatarElements.rightArm.style.left = '';
                    index++;
                    doNextSign();
                }, 1500);
            }
            else if (word === 'GOOD' || word === 'YES') {
                // Thumbs up
                window.avatarElements.rightArm.style.transform = 'rotate(-10deg)';
                window.avatarElements.rightArm.style.height = '60px';
                setTimeout(() => {
                    window.avatarElements.rightArm.style.height = '70px';
                    window.avatarElements.rightArm.style.transform = 'rotate(-20deg)';
                    index++;
                    doNextSign();
                }, 1500);
            }
            else if (word === 'BAD' || word === 'NO') {
                // Shake head
                let shakeCount = 0;
                const shakeInterval = setInterval(() => {
                    if (shakeCount >= 4) {
                        clearInterval(shakeInterval);
                        window.avatarElements.head.style.transform = 'rotate(0deg)';
                        index++;
                        doNextSign();
                    } else {
                        const rotate = shakeCount % 2 === 0 ? -15 : 15;
                        window.avatarElements.head.style.transform = `rotate(${rotate}deg)`;
                        shakeCount++;
                    }
                }, 200);
            }
            else {
                // Default animation
                window.avatarElements.leftArm.style.transform = 'rotate(45deg)';
                window.avatarElements.rightArm.style.transform = 'rotate(-45deg)';
                setTimeout(() => {
                    window.avatarElements.leftArm.style.transform = 'rotate(20deg)';
                    window.avatarElements.rightArm.style.transform = 'rotate(-20deg)';
                    index++;
                    doNextSign();
                }, 1000);
            }
        }
        
        doNextSign();
    };
    
    console.log('✅ Avatar system ready!');
})();