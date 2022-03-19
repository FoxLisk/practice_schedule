const HIGHLIGHT_BACKGROUND = 'bg-red-300';
const STATE_KEY = 'state';

class State {
    day = 1;
    categories = [];

    constructor(day, categories) {
        this.day = day || 1;
        this.categories = categories || [];
    }

    serialize() {
        return JSON.stringify( {
            day: this.day,
            categories: this.categories,
        });
    }

    static blank() {
        return new State(0, [
            {
                'name': 'Thing A',
                'topics': [
                    'Topic 1',
                    'Topic 2',
                ],
            },
            {
                'name': 'Thing B',
                'topics': [
                    'Topic 1',
                    'Topic 2',
                    'Topic 3',
                ],
            },
            {
                'name': 'Thing C',
                'topics': [
                    'Topic 1',
                    'Topic 2',
                    'Topic 3',
                    'Topic 4',
                    'Topic 5',
                ],
            },


        ]);
    }

    static validate_category(category) {
        if (!category.name) {
            return 'Categories need names';
        }
        if (!category.topics || !Array.isArray(category.topics)) {
            return 'Categories need topics';
        }
        return null;
    }
    
    static validate_categories(categories) {
        if (!Array.isArray(categories)) {
            return 'Categories is not an array';
        }
        for (let c of categories) {
            let e = State.validate_category(c);
            if (e) {
                return e;
            }
        }
        return null;
    }

    static from_dict(dict) {
        if (!dict.day) {
            return [null, 'Missing day.'];
        }
        let day = parseInt(dict.day);
        if (Number.isNaN(day)) {
            return [null, 'Invalid value for day.'];
        }
        if (!dict.categories) {
            return [null, 'Missing categories.'];
        }
        let e = State.validate_categories(dict.categories);
        if (e) {
            return [null, e];
        }
        return [new State(dict.day, dict.categories), null];
    }

    static from_categories_or_dict(obj) {
        // this will handle either a serialized self or a list of categories
        // errors assume it's supposed to be a list of categories
        if (Array.isArray(obj)) {
            let e = State.validate_categories(obj);
            if (e) {
                return [null, e];
            } else {
                return [new State(1, obj), null];
            }
        } else {
            let [s, e] = State.from_dict(obj);
            if (e) {
                return [null, e];
            } else {
                return [s, null];
            }
        }
    }

    static deserialize(json) {
        try {
            let obj = JSON.parse(json);
            return State.from_dict(obj);
        } catch (SyntaxError) {
            return [null, 'Invalid JSON'];
        }
    }

    static deserialize_maybe(json) {
        let [s, e] = State.deserialize(json);
        return s || State.blank();
    }

}

document.addEventListener('DOMContentLoaded', async function () {
    let category_template = document.getElementById('category_template'),
        topic_template = document.getElementById('topic_row'),
        container = document.getElementById('practice_rows'),
        day_text = document.getElementById('day'),
        new_day_button = document.getElementById('new_day'),
        reset_button = document.getElementById('reset'),
        upload_input = document.getElementById('upload_input'),
        upload_button = document.getElementById('upload_button');
    var state,
        category_elems = [];

    function set_day(n) {
        state.day = n;
        day_text.textContent = n;
        highlight(category_elems, n-1); // 0-based indexing
    };

    function init_state() {
        let stored = window.localStorage.getItem(STATE_KEY);
        state = State.deserialize_maybe(stored);
        console.log(state);
    }

    function store_state() {
        window.localStorage.setItem(STATE_KEY, state.serialize());
    }

    function reflect_state() {
        init_categories(state.categories);
        set_day(state.day);
    }

    function init_categories(categories) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        while (category_elems.length) {
            category_elems.shift();
        }
        for (let cat of categories) {
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
    }

    function init() {
        init_state();
        reflect_state();
    }

    init();

    new_day_button.addEventListener('click', function(e) {
        e.preventDefault();
        set_day(state.day + 1);
        store_state();
    });

    function clear_state() {
        window.localStorage.removeItem(STATE_KEY);
    }

    reset_button.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.confirm('This will reset progress to day 1. Continue?')) {
            set_day(1)
        }
    });

    upload_button.addEventListener('click', async function(e) {
        e.preventDefault();
        let file = upload_input.files[0];
        if (!file) {
            window.alert('You have to select a file');
            return;
        }
        let t = await file.text();
        let o;
        try {
            o = JSON.parse(t);
        } catch (SyntaxError) {
            window.alert("That's invalid JSON.");
            return;
        }
        let [new_state, err] = State.from_categories_or_dict(o);

        if (err) {
            window.alert("That's valid JSON but invalid contents: " + err);
        }
        if (window.confirm(
            'This will replace all current data. ' +
            'This is irreversible. Continue?')) {
            state = new_state;
            reflect_state();
            store_state();
        }
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
