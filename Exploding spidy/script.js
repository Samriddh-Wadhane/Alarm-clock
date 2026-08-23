const time = document.getElementById('time');
const alarmInput = document.getElementById('alarmInput');
const setAlarmButton = document.getElementById('setAlarm');
const stopAlarmButton = document.getElementById('stopAlarm');
const testAlarmButton = document.getElementById('testAlarm');
const statusText = document.getElementById('statusText');
const countdown = document.getElementById('countdown');
const date = document.getElementById('date');
const explosion = document.getElementById('explosion');
const alarmClock = document.getElementById('alarmClock');
const alarmSound = new Audio('./wings_of_freedom-bomb-explosion-469038%20(1).mp3');
alarmSound.preload = 'auto';
let alarmTime = null;
let alarmTriggered = false;
let alarmRinging = false;

function formatTime(value) {
    return String(value).padStart(2, '0');
}

function showCurrentTime() {
    const now = new Date();
    time.textContent = `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}:${formatTime(now.getSeconds())}`;
}

function getAlarmTime() {
    const match = alarmInput.value.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;

    return { hour, minute };
}

function setAlarm() {
    const selectedTime = getAlarmTime();
    if (!selectedTime) {
        alarmInput.focus();
        statusText.textContent = 'INVALID TIME';
        alarmClock.classList.remove('armed');
        return;
    }

    alarmTime = selectedTime;
    alarmTriggered = false;
    alarmRinging = false;
    alarmSound.pause();
    alarmSound.currentTime = 0;

    alarmClock.classList.add('armed');
    statusText.textContent = 'ARMED';
    updateCountdown();
}

function stopAlarm() {
    alarmRinging = false;
    alarmTriggered = true;
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmTime = null;
    alarmClock.classList.remove('armed', 'ringing', 'destroyed');
    statusText.textContent = 'STANDBY';
    countdown.textContent = 'NO ALARM SET';
    explosion.classList.remove('active');
    showCurrentTime();
}

function playAlarmSound() {
    alarmSound.currentTime = 0;
    alarmSound.loop = true;
    alarmSound.play().catch(error => {
        console.error('Alarm sound could not play:', error);
        statusText.textContent = 'AUDIO BLOCKED';
    });
}

function detonate() {
    alarmTriggered = true;
    alarmRinging = true;
    alarmClock.classList.add('ringing');
    alarmClock.classList.add('destroyed');
    statusText.textContent = 'DETONATING';
    countdown.textContent = 'WAKE PROTOCOL ACTIVE';
    explosion.classList.remove('active');
    void explosion.offsetWidth;
    explosion.classList.add('active');
    time.textContent = 'ALARM!';
    playAlarmSound();
}

function updateCountdown() {
    if (!alarmTime || alarmTriggered) return;
    const now = new Date();
    const target = new Date(now);
    target.setHours(alarmTime.hour, alarmTime.minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const remaining = Math.ceil((target - now) / 60000);
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    countdown.textContent = `T-${formatTime(hours)}:${formatTime(minutes)}`;
}

function updateTime() {
    const now = new Date();
    date.textContent = now.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();

    if (alarmTime && !alarmTriggered &&
        now.getHours() === alarmTime.hour && now.getMinutes() === alarmTime.minute) {
        detonate();
    } else if (!alarmRinging) {
        showCurrentTime();
    }

    updateCountdown();
    setTimeout(updateTime, 1000);
}

alarmInput.addEventListener('input', () => {
    alarmInput.value = alarmInput.value.replace(/[^\d:]/g, '').slice(0, 5);
});

setAlarmButton.addEventListener('click', setAlarm);
stopAlarmButton.addEventListener('click', stopAlarm);
testAlarmButton.addEventListener('click', detonate);
alarmInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') setAlarm();
});

updateTime();