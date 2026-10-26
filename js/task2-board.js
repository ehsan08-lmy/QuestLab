'use strict';

const MAX_IN_PROGRESS = 3;

// Quest data
const quests = [
    {
        id: 'q01',
        title: 'Map the Crystal Cavern',
        description: 'Sketch the route and mark hidden passages.',
        status: 'todo',
        priority: 3,
        tag: 'Exploration',
        reward: 40
    },
    {
        id: 'q02',
        title: 'Repair the Sky Bridge',
        description: 'Gather materials and restore the crossing.',
        status: 'todo',
        priority: 2,
        tag: 'Crafting',
        reward: 35
    },
    {
        id: 'q03',
        title: 'Decode the Ancient Rune',
        description: 'Translate the inscription in the old tower.',
        status: 'progress',
        priority: 3,
        tag: 'Puzzle',
        reward: 50
    },
    {
        id: 'q04',
        title: 'Train with the Rangers',
        description: 'Complete the forest navigation challenge.',
        status: 'todo',
        priority: 1,
        tag: 'Training',
        reward: 20
    },
    {
        id: 'q05',
        title: 'Collect Moon Herbs',
        description: 'Find three rare plants before nightfall.',
        status: 'progress',
        priority: 2,
        tag: 'Gathering',
        reward: 25
    },
    {
        id: 'q06',
        title: 'Protect the Village',
        description: 'Help the guards prepare the eastern gate.',
        status: 'done',
        priority: 3,
        tag: 'Combat',
        reward: 60
    },
    {
        id: 'q07',
        title: 'Brew a Healing Potion',
        description: 'Combine the ingredients at the workshop.',
        status: 'todo',
        priority: 2,
        tag: 'Crafting',
        reward: 30
    },
    {
        id: 'q08',
        title: 'Find the Lost Scout',
        description: 'Follow the footprints near the river.',
        status: 'done',
        priority: 1,
        tag: 'Exploration',
        reward: 45
    },
    {
        id: 'q09',
        title: 'Practice Spellcasting',
        description: 'Land five accurate spells at the range.',
        status: 'progress',
        priority: 1,
        tag: 'Training',
        reward: 20
    },
    {
        id: 'q10',
        title: 'Open the Sunken Archive',
        description: 'Solve the water-level mechanism.',
        status: 'todo',
        priority: 3,
        tag: 'Puzzle',
        reward: 55
    }
];

// Board columns
const columns = [
    { id: 'todo', title: 'To do' },
    { id: 'progress', title: 'In progress' },
    { id: 'done', title: 'Done' }
];

// DOM elements
const board = document.querySelector('#kanban-board');
const boardControls = document.querySelector('#board-controls');
const boardNotice = document.querySelector('#board-notice');
const progressText = document.querySelector('#progress-text');
const progressBar = document.querySelector('#progress-bar');
const progressFill = document.querySelector('#progress-fill');

// Current board settings
let activeTag = 'All tags';
let sortPriority = false;

// Create the filter and sorting controls.
function createBoardControls() {
    const filterField = document.createElement('div');
    filterField.className = 'field';

    const filterLabel = document.createElement('label');
    filterLabel.htmlFor = 'tag-filter';
    filterLabel.textContent = 'Filter by tag';

    const filter = document.createElement('select');
    filter.id = 'tag-filter';
    filter.name = 'tag-filter';

    const tags = [
        'All tags',
        ...new Set(quests.map((quest) => quest.tag))
    ];

    for (const tag of tags) {
        const option = document.createElement('option');

        option.value = tag;
        option.textContent = tag;

        filter.append(option);
    }

    filter.addEventListener('change', () => {
        activeTag = filter.value;
        renderBoard();
    });

    filterField.append(filterLabel, filter);

    const sortButton = document.createElement('button');

    sortButton.type = 'button';
    sortButton.className = 'button button-secondary';
    sortButton.dataset.action = 'sort';
    sortButton.textContent = 'Sort: original order';
    sortButton.setAttribute('aria-pressed', 'false');

    boardControls.append(filterField, sortButton);
}

// Calculate and display the completed quest percentage.
function updateProgress() {
    let completed = 0;

    for (const quest of quests) {
        if (quest.status === 'done') {
            completed += 1;
        }
    }

    const percentage = Math.round(
        (completed / quests.length) * 100
    );

    progressText.textContent =
        `${percentage}% complete · ${completed}/${quests.length} quests`;

    progressFill.style.width = `${percentage}%`;

    progressBar.setAttribute(
        'aria-valuenow',
        String(percentage)
    );
}

// Create a card for an individual quest.
function createQuestCard(quest) {
    const card = document.createElement('article');
    card.className = 'quest-card';
    card.dataset.questId = quest.id;

    const title = document.createElement('h4');
    title.textContent = quest.title;

    const description = document.createElement('p');
    description.textContent = quest.description;

    const meta = document.createElement('div');
    meta.className = 'quest-meta';

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = quest.tag;

    const priority = document.createElement('span');
    priority.className = 'priority';
    priority.textContent =
        `Priority ${quest.priority} · ${quest.reward} XP`;

    meta.append(tag, priority);

    const actions = document.createElement('div');
    actions.className = 'quest-actions';

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.dataset.action = 'previous';
    previous.dataset.id = quest.id;
    previous.textContent = '← Back';
    previous.disabled = quest.status === 'todo';

    const next = document.createElement('button');
    next.type = 'button';
    next.dataset.action = 'next';
    next.dataset.id = quest.id;
    next.textContent =
        quest.status === 'done' ? 'Completed ✓' : 'Move →';
    next.disabled = quest.status === 'done';

    actions.append(previous, next);

    card.append(title, description, meta, actions);

    return card;
}

// Render the complete Kanban board.
function renderBoard() {
    board.replaceChildren();

    for (const column of columns) {
        const section = document.createElement('section');

        section.className = 'kanban-column';
        section.dataset.status = column.id;

        const heading = document.createElement('h3');
        heading.className = 'column-heading';

        const title = document.createElement('span');
        title.textContent = column.title;

        let count = 0;

        for (const quest of quests) {
            if (
                quest.status === column.id &&
                (
                    activeTag === 'All tags' ||
                    quest.tag === activeTag
                )
            ) {
                count += 1;
            }
        }

        const countBadge = document.createElement('span');
        countBadge.className = 'column-count';
        countBadge.textContent = String(count);

        heading.append(title, countBadge);

        const list = document.createElement('div');
        list.className = 'quest-list';

        let visibleQuests = quests.filter(
            (quest) =>
                quest.status === column.id &&
                (
                    activeTag === 'All tags' ||
                    quest.tag === activeTag
                )
        );

        // Sort quests by priority when sorting is enabled.
        if (sortPriority) {
            visibleQuests = visibleQuests
                .slice()
                .sort(
                    (first, second) =>
                        second.priority - first.priority
                );
        }

        for (const quest of visibleQuests) {
            list.append(createQuestCard(quest));
        }

        // Show a message if the column has no matching quests.
        if (visibleQuests.length === 0) {
            const empty = document.createElement('p');

            empty.className = 'no-results';
            empty.textContent =
                activeTag === 'All tags'
                    ? 'No quests in this column.'
                    : 'No matching quests here.';

            list.append(empty);
        }

        section.append(heading, list);
        board.append(section);
    }

    updateProgress();
}

// Handle the sort button using event delegation.
boardControls.addEventListener('click', (event) => {
    const button = event.target.closest(
        'button[data-action]'
    );

    if (!button) {
        return;
    }

    if (button.dataset.action === 'sort') {
        sortPriority = !sortPriority;

        button.textContent = sortPriority
            ? 'Sort: priority ↓'
            : 'Sort: original order';

        button.setAttribute(
            'aria-pressed',
            String(sortPriority)
        );

        renderBoard();
        return;
    }
});

// Handle quest movement using event delegation.
board.addEventListener('click', (event) => {
    const button = event.target.closest(
        'button[data-action]'
    );

    if (!button || !board.contains(button)) {
        return;
    }

    const quest = quests.find(
        (item) => item.id === button.dataset.id
    );

    if (!quest) {
        return;
    }

    const currentIndex = columns.findIndex(
        (column) => column.id === quest.status
    );

    const targetIndex =
        currentIndex +
        (button.dataset.action === 'next' ? 1 : -1);

    if (
        targetIndex < 0 ||
        targetIndex >= columns.length
    ) {
        return;
    }

    const targetStatus = columns[targetIndex].id;

    // Count the quests currently in progress.
    let inProgressCount = 0;

    for (const item of quests) {
        if (item.status === 'progress') {
            inProgressCount += 1;
        }
    }

    // Prevent more than three quests from being in progress.
    if (
        targetStatus === 'progress' &&
        inProgressCount >= MAX_IN_PROGRESS
    ) {
        boardNotice.textContent =
            `Move blocked: “In progress” can contain at most ` +
            `${MAX_IN_PROGRESS} quests. Finish or move one first.`;

        return;
    }

    // Update the quest and redraw the board.
    quest.status = targetStatus;
    boardNotice.textContent = '';

    renderBoard();
});

// Initialize the board.
createBoardControls();
renderBoard();