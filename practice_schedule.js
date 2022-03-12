const HIGHLIGHT_BACKGROUND = 'bg-red-300';
document.addEventListener('DOMContentLoaded', function () {
    let categories = [
        {
            'name': 'Chords',
            'topics': [
                'Major',
                'Minor',
                '7th',
                '4th String Root',
            ],
        },
        {
            'name': 'Scales',
            'topics': [
                'Diatonic',
                'Harmonic',
                'Blues',
                'Pentatonic',
            ],
        },
        {
            'name': 'Plucking',
            'topics': [
                'Up and down',
                'HO/PO',
                'Group of 3s',
                'Every other note',
                'Swing',
            ],
        },
        {
            'name': 'Arpeggios',
            'topics': [
                'Major',
                'Minor',
            ],
        },
    ];
    let category_template = document.getElementById('category_template'),
        topic_template = document.getElementById('topic_row'),
        container = document.getElementById('practice_rows'),
        day_text = document.getElementById('day'),
        new_day_button = document.getElementById('new_day'),
        reset_button = document.getElementById('reset');
    var day = 0,
        category_elems = [];


    for (let cat of categories) {
        console.log(cat);
        let c = category_template.content.cloneNode(true);
        c.querySelector('.title-text').textContent = cat.name;
        let topics = c.querySelector('.topics');
        for (let topic of cat.topics) {
            let t = topic_template.content.cloneNode(true);
            t.querySelector('.topic-text').textContent = topic;
            topics.appendChild(t);
        }
        container.appendChild(c);
    }
    document.querySelectorAll('.category').forEach(c => {
        category_elems.push(c);
    });

    function set_day(n) {
        day = n;
        day_text.textContent = day;
        highlight(category_elems, day-1); // 0-based indexing
    };

    function store_state() {
        let state = {
            day: day,
        };
        let serialized = JSON.stringify(state);
        window.localStorage.setItem('state', serialized);
    }

    function clear_state() {
        window.localStorage.removeItem('state');
    }

    function load_state() {
        let serialized = window.localStorage.getItem('state');
        if (serialized) {
            return JSON.parse(serialized);
        } else {
            return null;
        }
        
    }

    var state = load_state();
    day = state && state.day || 1;
    set_day(day);

    new_day_button.addEventListener('click', function(e) {
        e.preventDefault();
        set_day(day + 1);
        store_state();
    });

    reset_button.addEventListener('click', function(e) {
        e.preventDefault();
        clear_state();
        set_day(1)

    });
});
function highlight(categories, nth) {
    for (let elem of categories) {
        let children = elem.querySelector('.topics').children;
        let modulus = children.length;
        for (var i = 0; i < modulus; i++) {
            if (nth % modulus === i) {
                children[i].classList.add(HIGHLIGHT_BACKGROUND);
            } else {
                children[i].classList.remove(HIGHLIGHT_BACKGROUND);
            }
        }
    }
};
