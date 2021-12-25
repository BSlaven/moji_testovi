// navbar
const navbar = document.querySelector('#navbar');
const toggleNavbar = document.querySelector('#navbar-toggle');
const closeNavbar = document.querySelector('#close-navbar');

// user name form
const nameInput = document.querySelector('#name-input');
const form = document.querySelector('#form');
const currentUser = document.querySelector('#current-user');
const errorElement = document.querySelector('#error');

// all tests available
const allTestsElement = document.querySelector('#all-tests');
const testsBElement = document.querySelector('#tests-b');
const testsCElement = document.querySelector('#tests-c');
const testsFirstAidElement = document.querySelector('#tests-first-aid');

// Iz baze
const allTests = JSON.parse(localStorage.getItem('sviTestovi')) || [];
const testsB = allTests.filter(test => test.kategorijaTesta === 'B');
const testsC = allTests.filter(test => test.kategorijaTesta === 'C');
const testsFirsAid = allTests.filter(test => test.kategorijaTesta === 'Prva_pomoć');
let currentTest;
let selectedTestQuestions = [];
let indeksPitanja = 0;
let aktivniIndeksPitanja = 0;

// Rješavanje testa
const startTestBtn = document.querySelector('#start-test-btn');
const testContainer = document.querySelector('#test-container');
const testTitleElement = document.querySelector('#test-title');
const currentTotalTestsElement = document.querySelector('#header-span');
const testContent = document.querySelector('#test-content');
const tekstTrenutnogPitanja = document.querySelector('#trenutno-pitanje');
const exitTestBtn = document.querySelector('#exit-test');
const poljeZaOdgovore = document.querySelector('#poljeZaOdgovore');
const endTestBtn = document.querySelector('#end-test-btn');
const sljedećePitanje = document.querySelector('#naprijed');
const prethodnoPitanje = document.querySelector('#nazad');
let trenutniOdgovori;
let trenutniInputi;
let mojIndeks;
let sakupljenoBodova = 0;

form.addEventListener('submit', e => {
  e.preventDefault();
  checkNameIsValid();
  enterNameHanlder();
});

toggleNavbar.addEventListener('click', () => {
  toggleNav();
});

closeNavbar.addEventListener('click', () => {
  navbar.classList.remove('visible');
});

function toggleNav() {
  navbar.classList.toggle('visible');
}

function checkNameIsValid() {
  let korisničkoIme = nameInput.value.trim();
  if(!korisničkoIme) prikazGreške();
}

function prikazGreške() {
  errorElement.textContent = 'Morate unijeti svoje ime!';
  errorElement.classList.add('error');
}

function enterNameHanlder() {
  if(!nameInput.value.trim()) return;
  errorElement.style.display = 'none';
  form.style.display = 'none';
  currentUser.style.display = 'block';
  currentUser.textContent = nameInput.value;
}

poredajTestove(testsB, testsBElement);
poredajTestove(testsC, testsCElement);
poredajTestove(testsFirsAid, testsFirstAidElement);

function poredajTestove(tests, polje) {
  tests.map(test => {
    let oneTest = document.createElement('div');
    oneTest.setAttribute('id', test.id);
    oneTest.classList.add(`test`, `test${test.kategorijaTesta}`);
    oneTest.textContent = test.nazivTesta;
    oneTest.addEventListener('click', e => {
      testClickHandler(e);
    })
    polje.appendChild(oneTest);
  });
}

allTestsElement.addEventListener('click', () => {
  if(!currentUser.textContent) prikazGreške();
});

function testClickHandler(element) {
  if(!currentUser.textContent) return;
  const id = +element.target.id;
  const selectedTest = allTests.find(test => test.id === id);
  currentTest = selectedTest;
  selectedTestQuestions = [...selectedTest.spisakPitanja];
  allTestsElement.style.display = 'none';
  startTestBtn.style.display = 'block';
}

startTestBtn.addEventListener('click', e => {
  e.target.style.display = 'none';
  testContainer.style.display = 'block';
  postaviStrukturuTesta(currentTest, selectedTestQuestions);
});

function postaviStrukturuTesta(mojTest, listaPitanja) {
  poljeZaOdgovore.innerHTML = '';
  testTitleElement.textContent = mojTest.nazivTesta;
  currentTotalTestsElement.textContent = `${indeksPitanja + 1}/${selectedTestQuestions.length}`;
  let trenutnoPitanje = listaPitanja[indeksPitanja];
  console.log('trenutno pitanje: ', trenutnoPitanje)
  tekstTrenutnogPitanja.textContent = trenutnoPitanje.tekst;
  poljeZaOdgovore.classList.add('polje-odgovora');
  trenutniOdgovori = trenutnoPitanje.odgovori;
  poredajOdgovore(trenutniOdgovori, poljeZaOdgovore);
  testContent.appendChild(tekstTrenutnogPitanja);
  testContent.appendChild(poljeZaOdgovore);
  provjeriIndekse();
}

function provjeriIndekse() {
  if(indeksPitanja < aktivniIndeksPitanja) {
    trenutniInputi = testContent.querySelectorAll('[type="checkbox"]');
    trenutniInputi.forEach(input => {
      input.disabled = true;
      const trenutniLabeli = testContent.querySelectorAll('label');
      trenutniLabeli.forEach((elem, index) => {
        elem.classList.add(trenutniInputi[index].dataset.tačno === 'true' ? 'zelena-pozadina-odgovora' : 'crvena-pozadina-odgovora');
      });
    });
  }
}

function poredajOdgovore(sviOdgovori, polje) {
  sviOdgovori.map(odgovor => {
    let labelZaOdgovor = document.createElement('label');
    let inputZaOdgovor = document.createElement('input');
    let spanZaOdgovor = document.createElement('span');
    labelZaOdgovor.textContent = `${odgovor.tekstOdgovora}`;
    labelZaOdgovor.setAttribute('for', odgovor.idOdgovora);
    labelZaOdgovor.classList.add('label-odgovora');
    inputZaOdgovor.setAttribute('type', 'checkbox');
    inputZaOdgovor.setAttribute('id', odgovor.idOdgovora);
    inputZaOdgovor.setAttribute('data-tačno', odgovor.tačno)
    inputZaOdgovor.classList.add('input-odgovora');
    spanZaOdgovor.classList.add('span-odgovora');
    labelZaOdgovor.prepend(spanZaOdgovor);
    labelZaOdgovor.prepend(inputZaOdgovor);
    polje.appendChild(labelZaOdgovor);
  });
}

exitTestBtn.addEventListener('click', () => {
  window.location.reload();
});

function dodajOdgovore() {
  const { vrijednostTrenutnogPitanja, sviTačni } = izvuciVrijednostPitanja();
  const izabraniOdgovori = izvuciIzabraneOdgovore();
  obračunajBodove(sviTačni, izabraniOdgovori, vrijednostTrenutnogPitanja);
}

function izvuciVrijednostPitanja() {
  const mojaPitanja = [...currentTest.spisakPitanja];
  let trenutnoPitanje = mojaPitanja[indeksPitanja];
  const vrijednostTrenutnogPitanja = +trenutnoPitanje.vrijednostPitanja;
  let sviTačni = [];
  trenutnoPitanje.odgovori.map(elem => (elem.tačno) ? sviTačni.push(elem.tačno) : null);
  return {
    vrijednostTrenutnogPitanja: vrijednostTrenutnogPitanja,
    sviTačni: sviTačni
  }
}

function izvuciIzabraneOdgovore() {
  trenutniInputi = testContent.querySelectorAll('[type="checkbox"]');
  let izabraniOdgovori = [];
  trenutniInputi.forEach(mojInput => {
    if(mojInput.checked) izabraniOdgovori.push(mojInput);
  });
  return izabraniOdgovori;
}

function obračunajBodove(svi, izabrani, vrijednost) {
  if(svi.length === izabrani.length && izabrani.every(elem => elem.dataset.tačno === 'true')) {
    sakupljenoBodova += vrijednost;
  }
}

sljedećePitanje.addEventListener('click', e => {
  (indeksPitanja === aktivniIndeksPitanja) ? dodajOdgovore() : null;
  if((indeksPitanja + 1) >= selectedTestQuestions.length) {
    endTestBtn.style.display = 'block';
    e.target.disabled = true;
    prethodnoPitanje.disabled = true;
    return;
  }
  testContent.innerHTML = '';
  (indeksPitanja !== aktivniIndeksPitanja) ? indeksPitanja++ : povećajObaIndeksa();
  postaviStrukturuTesta(currentTest, selectedTestQuestions);
});

function povećajObaIndeksa() {
  indeksPitanja++;
  aktivniIndeksPitanja++;
}

prethodnoPitanje.addEventListener('click', () => {
  if(indeksPitanja <= 0) return;
  trenutniInputi = testContent.querySelectorAll('[type="checkbox"]');
  testContent.innerHTML = '';
  indeksPitanja--;
  postaviStrukturuTesta(currentTest, selectedTestQuestions);
});

endTestBtn.addEventListener('click', () => {
  testContainer.style.display = 'none';
  izračunajPrikažiRezultat();
});

function izračunajPrikažiRezultat() {
  let ukupnoBodova = currentTest.spisakPitanja.map(pitanje => parseInt(pitanje.vrijednostPitanja)).reduce((acc, inc) => acc + inc);
  const procenatOsvojenihBodova = Math.round((sakupljenoBodova / ukupnoBodova) * 100);
  prikažiRezultateTesta(ukupnoBodova, sakupljenoBodova, procenatOsvojenihBodova);
}

function prikažiRezultateTesta(ukupno, osvojeno, procenat) {
  const prikazRezultata = document.querySelector('#prikaz-rezultata');
  const porukaKorisniku = document.querySelector('#poruka-korisniku');

  prikazRezultata.textContent = `Osvojenih bodova ${osvojeno}, od ukupno ${ukupno}. Procenat tačnosti je: ${procenat}.`
  porukaKorisniku.classList.add(procenat >= 95 ? 'zelena-poruka' : 'crvena-poruka')
  porukaKorisniku.textContent = procenat >= 95 ? `Položili ste test!` : `Niste položili test!`
}
