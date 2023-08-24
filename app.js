const getAPIUrl = (limit, offset) =>
	`https://dummyjson.com/users?limit=${limit}&skip=${offset}&select=firstName,age,lastName,address,email,phone`;

let ApplicationState = {
	currentPage: 1,
	loading: false,
	hasError: false,
	pageQuantity: 10,
};

const appElement = document.getElementById('dataBody');
const loadingElement = document.getElementById('loading');
const tableElement = document.getElementById('dataBody');
const currentPageElement = document.getElementById('current-page');
const containerElement = document.getElementById('container');

// create N buttons, where N is the number of pages
const ButtonsArray = Array.from(
	{ length: ApplicationState.pageQuantity },
	(v, i) => i + 1
);

const updateApplicationState = (newState) => {
	ApplicationState = {
		...ApplicationState,
		...newState,
	};
};

const getDataFromServer = async (limit = 10, offset = 0) => {
	try {
		const response = await fetch(getAPIUrl(limit, offset));
		const data = await response.json();

		return data.users.map((item) => {
			return {
				...item,
				name: `${item.firstName} ${item.lastName}`,
				location: `${item.address.address} ${item.address.postalCode}`,
			};
		});
	} catch (error) {
		showError(error);
	}
};

const setPage = (page) => {
	currentPageElement.innerHTML = page;
	updateApplicationState({ currentPage: page });
};

const setCurrentPageButton = (page) => {
	const button = document.getElementById(`button-page-${page}`);
	button.classList.add('bg-blue-500');
	button.classList.add('text-white');
	button.disabled = true;

	// remove bg-blue-500 and text-white from all other buttons
	ButtonsArray.forEach((item) => {
		if (item !== page) {
			const button = document.getElementById(`button-page-${item}`);
			button.classList.remove('bg-blue-500');
			button.classList.remove('text-white');
			button.disabled = false;
		}
	});
};

const setLoading = (loading) => {
	appElement.style.visibility = loading ? 'hidden' : 'visible';
	loadingElement.style.visibility = loading ? 'visible' : 'hidden';

	updateApplicationState({ loading });
};

const showError = (error) => {
	const errorElement = `
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error!</strong>
        <p>
            <strong>${error}</strong>
            <br>
            <a href="/" class="absolute top-0 bottom-0 right-0 px-4 py-3">Reload</a>
        </p>
    </div>
    `;

	containerElement.innerHTML = errorElement;
	updateApplicationState({ hasError: true });
};

const updateAllElementsWith = (data) => {
	let rows = '';
	data.forEach((item) => {
		const row = `
            <tr>
                <td class="py-2 px-4">${item.name}</td>
                <td class="py-2 px-4">${item.age}</td>
                <td class="py-2 px-4">${item.location}</td>
                <td class="py-2 px-4">${item.email}</td>
            </tr>
        `;
		rows += row;
	});

	tableElement.innerHTML = rows;
};

const paginate = async (item) => {
	setPage(item);

	// item * 10 because we want to skip 10 items
	setLoading(true);
	const newData = await getDataFromServer(10, item * 10);
	updateAllElementsWith(newData);
	setLoading(false);
	setCurrentPageButton(item);
};

const init = async () => {
	let buttons = ``;
	// create 10 buttons
	ButtonsArray.forEach((item) => {
		const button = `
            <button
                id="button-page-${item}"
                onclick="paginate(${item})"
                class="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded">
                ${item}
            </button>
        `;

		buttons += button;
	});

	// put the buttons on the page
	document.getElementById('pagination').innerHTML = buttons;

	// get the first page of data
	paginate(1);
};

init();
