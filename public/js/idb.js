let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save a reference to db in global variable
    db = event.target.result;

    // check if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.createObjectStore('new_transaction');

    budgetObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readWrite');

    const budgetObjectStore = transaction.createObjectStore('new_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    budgetObjectStore.clear();

                    alert('All saved transactions are submitted!')
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}