'use strict';

// Game settings
const TOTAL_SKILL_POINTS = 20;
const MIN_SKILL = 1;
const MAX_SKILL = 10;

const TAKEN_NAMES = [
    'Aria',
    'Orion',
    'Raven',
    'Nova'
];

// Minimum skill requirements for each character class
const CLASS_RULES = {
    Warrior: {
        skill: 'strength',
        minimum: 5
    },
    Mage: {
        skill: 'magic',
        minimum: 5
    },
    Ranger: {
        skill: 'agility',
        minimum: 5
    }
};

const SKILL_NAMES = [
    'strength',
    'magic',
    'agility',
    'wisdom'
];

// Form and DOM elements
const form = document.querySelector('#character-form');
form.noValidate = true;

const formSummary = document.querySelector('#form-summary');
const pointsUsed = document.querySelector('#points-used');
const pointsTrack = document.querySelector('#points-track');
const pointsFill = document.querySelector('#points-fill');
const preview = document.querySelector('#character-preview');
const result = document.querySelector('#character-result');

const fieldNames = [
    'name',
    'class',
    'color',
    ...SKILL_NAMES
];

const touchedFields = new Set();

// Get a form field by its name.
function field(name) {
    return form.elements.namedItem(name);
}

// Calculate the total number of skill points.
function getSkillTotal() {
    let total = 0;

    for (const skill of SKILL_NAMES) {
        total += Number(field(skill).value) || 0;
    }

    return total;
}

// Validate an individual form field.
function validateField(name) {
    const input = field(name);

    let message = '';
    const value = input.value.trim();

    if (input.required && value === '') {
        message = 'This field is required.';
    } else if (name === 'name') {
        if (value.length < 3 || value.length > 16) {
            message = 'Use a name from 3 to 16 characters.';
        } else if (
            TAKEN_NAMES.some(
                (taken) =>
                    taken.toLowerCase() === value.toLowerCase()
            )
        ) {
            message =
                'That name is already taken. Choose another name.';
        }
    } else if (SKILL_NAMES.includes(name)) {
        const number = Number(value);

        if (
            !Number.isInteger(number) ||
            number < MIN_SKILL ||
            number > MAX_SKILL
        ) {
            message =
                `Enter a whole number from ${MIN_SKILL} to ${MAX_SKILL}.`;
        } else if (getSkillTotal() !== TOTAL_SKILL_POINTS) {
            message =
                `All four skills must total exactly ${TOTAL_SKILL_POINTS} ` +
                `points (current total: ${getSkillTotal()}).`;
        }
    } else if (
        name === 'class' &&
        value &&
        CLASS_RULES[value]
    ) {
        const rule = CLASS_RULES[value];

        if (Number(field(rule.skill).value) < rule.minimum) {
            message =
                `${value} characters need ${rule.skill} ` +
                `of at least ${rule.minimum}.`;
        }
    }

    // Display the error message for this field.
    const error = document.querySelector(`#${name}-error`);

    if (error) {
        error.textContent = message;
    }

    input.setAttribute(
        'aria-invalid',
        String(Boolean(message))
    );

    input.classList.toggle(
        'invalid-field',
        Boolean(message)
    );

    input.classList.toggle(
        'valid-field',
        !message &&
        touchedFields.has(name) &&
        value !== ''
    );

    return message;
}

// Validate every field and collect all errors.
function validateAll() {
    const errors = [];

    for (const name of fieldNames) {
        const message = validateField(name);

        if (message) {
            errors.push({
                name,
                message
            });
        }
    }

    return errors;
}

// Update the skill-points counter and progress bar.
function updatePoints() {
    const total = getSkillTotal();

    pointsUsed.textContent =
        `${total} / ${TOTAL_SKILL_POINTS}`;

    pointsUsed.classList.toggle(
        'is-error',
        total !== TOTAL_SKILL_POINTS
    );

    pointsTrack.setAttribute(
        'aria-valuenow',
        String(Math.min(total, TOTAL_SKILL_POINTS))
    );

    pointsFill.style.width =
        `${Math.min(
            100,
            Math.max(
                0,
                (total / TOTAL_SKILL_POINTS) * 100
            )
        )}%`;
}

// Update the live character preview.
function updatePreview() {
    const name = field('name').value.trim();
    const characterClass = field('class').value;
    const color = field('color').value || 'violet';

    document.querySelector('#preview-name').textContent =
        name || 'Your hero';

    preview.querySelector('.character-class').textContent =
        characterClass || 'Awaiting class';

    preview.classList.remove(
        'color-violet',
        'color-ocean',
        'color-ember'
    );

    preview.classList.add(`color-${color}`);

    for (const skill of SKILL_NAMES) {
        document.querySelector(`#preview-${skill}`).textContent =
            field(skill).value || '—';
    }

    updatePoints();
}

// Update the preview and validation feedback.
function updateFormFeedback() {
    updatePreview();

    for (const name of touchedFields) {
        validateField(name);
    }

    // Skill changes can affect the total and class requirements.
    if (SKILL_NAMES.some((name) => touchedFields.has(name))) {
        for (const skill of SKILL_NAMES) {
            if (touchedFields.has(skill)) {
                validateField(skill);
            }
        }

        if (touchedFields.has('class')) {
            validateField('class');
        }
    }
}

// Handle input events for live preview and validation.
form.addEventListener('input', (event) => {
    if (!event.target.name) {
        return;
    }

    if (touchedFields.has(event.target.name)) {
        updateFormFeedback();
    } else {
        updatePreview();
    }

    result.replaceChildren();
});

// Handle changes to select fields.
form.addEventListener('change', (event) => {
    if (!event.target.name) {
        return;
    }

    if (touchedFields.has(event.target.name)) {
        updateFormFeedback();
    } else {
        updatePreview();
    }
});

// Validate a field when the user leaves it.
form.addEventListener('focusout', (event) => {
    if (
        !event.target.name ||
        !fieldNames.includes(event.target.name)
    ) {
        return;
    }

    touchedFields.add(event.target.name);

    validateField(event.target.name);

    // Recheck related skill fields and class requirements.
    if (SKILL_NAMES.includes(event.target.name)) {
        for (const skill of SKILL_NAMES) {
            if (touchedFields.has(skill)) {
                validateField(skill);
            }
        }

        if (touchedFields.has('class')) {
            validateField('class');
        }
    }
});

// Handle form submission.
form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Check every field when the form is submitted.
    for (const name of fieldNames) {
        touchedFields.add(name);
    }

    const errors = validateAll();

    formSummary.replaceChildren();

    // Display errors and focus the first invalid field.
    if (errors.length > 0) {
        const message = document.createElement('p');

        message.textContent =
            `Please correct ${errors.length} ` +
            `${errors.length === 1 ? 'error' : 'errors'} ` +
            'before creating your character.';

        formSummary.append(message);
        formSummary.hidden = false;

        const firstInvalid = field(errors[0].name);
        firstInvalid.focus();

        result.replaceChildren();

        return;
    }

    // Create the character using valid form data.
    formSummary.hidden = true;

    const character = {
        name: field('name').value.trim(),
        characterClass: field('class').value,
        color: field('color').value,

        skills: Object.fromEntries(
            SKILL_NAMES.map(
                (skill) => [
                    skill,
                    Number(field(skill).value)
                ]
            )
        )
    };

    // Build the final result using DOM elements.
    const card = document.createElement('div');
    card.className = 'created-result';

    const title = document.createElement('strong');

    title.textContent =
        `${character.name} the ${character.characterClass} is ready!`;

    const details = document.createElement('p');

    details.textContent =
        `Skills — Strength ${character.skills.strength}, ` +
        `Magic ${character.skills.magic}, ` +
        `Agility ${character.skills.agility}, ` +
        `Wisdom ${character.skills.wisdom}. ` +
        `Total: ${getSkillTotal()} points.`;

    card.append(title, details);
    result.replaceChildren(card);

    // Reset the form after successful character creation.
    form.reset();
    touchedFields.clear();

    for (const name of fieldNames) {
        field(name).removeAttribute('aria-invalid');

        field(name).classList.remove(
            'invalid-field',
            'valid-field'
        );

        document.querySelector(`#${name}-error`).textContent = '';
    }

    updatePreview();
});

// Initialize the character preview.
updatePreview();