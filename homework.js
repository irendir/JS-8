let storage = function() {
    let countries = [];
    return {
        setCountries: data => countries = data,
        getCountries: () => countries
    }
}
const store = storage();



function filterCountries(search) {
    let filteredCountries = store.getCountries().filter(country => {
        let {name, capital, region} = country;
        return (name.toLowerCase().indexOf(search) > -1
            || capital.toLowerCase().indexOf(search) > -1
            || region.toLowerCase().indexOf(search) > -1);
    });
    renderCountries(filteredCountries);
}

function setListeners() {
    let tableBody = document.querySelector('table tbody');
    tableBody.onclick = e => {
        e.target.classList.toggle('bg-warning');
        console.log(e.target.innerText);
    }

    let searchInput = document.getElementById('search');
    searchInput.onkeyup = e => {
        document.querySelector('.countries-select').value = '';
        let searchValue = e.currentTarget.value;
        let searchLower = searchValue.toLowerCase();
        filterCountries(searchLower);
    }
}
let a = 0;
let b = 0;

function buildSelect(countries) {
    let regions = countries.map(country => country.region);
    let uniqueRegions = [];
    for(let region of regions) {
        if(region && uniqueRegions.indexOf(region) === -1) {
            uniqueRegions.push(region);
        }
    }
    console.log(uniqueRegions);
    let regionsHtml = uniqueRegions.reduce((acc, region) => acc + `<option value="${region}">${region}</option>`,
        `<option value="">Не выбрано</option>`)
    let regionsSelect = document.createElement('select');
    regionsSelect.className = 'form-control my-3 countries-select';
    regionsSelect.innerHTML = regionsHtml;
    document.querySelector('.countries-filters').prepend(regionsSelect);
    document.querySelector('.countries-select').onchange = e => {
        document.getElementById('search').value = '';
        let value = e.currentTarget.value;
        let search = value.toLowerCase();
        filterCountries(search);
    }
}

function renderCountries(countries = []) {
    let htmlTable = countries.reduce((acc, country, item) => acc + `<tr>
        <td>${item + 1}</td>
        <td>${country.name}</td>
        <td>${country.capital}</td>
        <td>${country.region}</td>
        <td>${country.population}</td>
        <td></td>
    </tr>`, '');
    document.querySelector('.container table tbody').innerHTML = htmlTable;
}

function processCountries(countries) {
    b = new Date().getTime();
    console.log('countries are loaded', b - a);
    document.getElementById('load-countries').disabled = false;
    document.querySelector('.load-countries-spinner').classList.add('hidden');
    document.querySelector('table').classList.remove('hidden');
    renderCountries(countries);
    buildSelect(countries);
    setListeners();
}

function loadCountries() {
    document.getElementById('load-countries').disabled = true;
    document.querySelector('.load-countries-spinner').classList.remove('hidden');
    if(localStorage.getItem('countries')) {
        let countriesStr = localStorage.getItem('countries');
        let countries = JSON.parse(countriesStr);
        processCountries(countries);
    } else {
        fetch('https://restcountries.com/v2/all').then(res => res.json()).then(function(data) {
            let countries = data.map(function(country) {
                let {alpha3Code, name, region, population, flag} = country;
                return {
                    alpha3Code, name,
                    capital: country.capital || '',
                    region, population, flag,
                    borders: country.borders || []
                }
            });
            store.setCountries(countries);
            console.log(JSON.stringify(countries));
            localStorage.setItem('countries', JSON.stringify(countries));
            processCountries(countries);
        });
    }

}

let loadBtn = document.getElementById('load-countries');
loadBtn.onclick = function(e) {
    a = new Date().getTime();
    loadCountries();
}

document.querySelector('.google-link').onclick = e => {
    e.preventDefault();
    if(confirm('Are you sure')) {
        alert('Ну и зря');
        window.location.href = e.currentTarget.attributes.href.value;
    }
}

// fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=20200302&json')
//ES6. default params

window.currenciesBackup = [];
window.onload = () => {
    fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=20200302&json').then(res => res.json()).then(function(data) {
        let currencies = data.map((currency) => {
            return {
                r030: currency.r030,
                txt: currency.txt,
                rate: currency.rate,
                cc: currency.cc,
                exchangedate: currency.exchangedate
            }
        });
        window.currenciesBackup = currencies;
        renderCurrencies(currencies);
        setListenersCurrencies();
        getDate();
    });
}
const renderCurrencies = (currencies) => {
    console.table(currencies);
    let htmlTableCurrency = currencies.reduce((acc, currency) => acc + `<tr>
        <td>${currency.txt}</td>
        <td>${currency.rate}</td>
    </tr>`, '');
    document.querySelector('.container .container-currency table tbody').innerHTML = htmlTableCurrency;
}
function setListenersCurrencies() {
    let searchInputCurrencies = document.getElementById('search-currency');
    searchInputCurrencies.onkeyup = e => {
        let searchValueCurrencies = e.currentTarget.value;
        console.log(searchValueCurrencies);
        let filteredCurrencies = window.currenciesBackup.filter(currency => currency.txt.toLowerCase().indexOf(searchValueCurrencies.toLowerCase()) > -1);
        renderCurrencies(filteredCurrencies);
    }
}
function getDate() {
    let dateCurrent = document.createElement('input');
    dateCurrent.type = 'date';
    let date;
    for (let currency of currenciesBackup) {
        date = new Date(currency.exchangedate)
    }
    console.log(date);
    date = moment().format('YYYY-MM-DD');
    console.log(date);
    dateCurrent.value = date;  
    document.querySelector('.date').append(dateCurrent);
}