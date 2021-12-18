// user name form
const nameInput = document.querySelector('#name-input');
const form = document.querySelector('#form');
const currentUser = document.querySelector('#current-user');
const errorElement = document.querySelector('#error');

// all tests available
const testsBElement = document.querySelector('#tests-b');
const testsCElement = document.querySelector('#tests-c');
const testsFirstAidElement = document.querySelector('#tests-first-aid');
// const container = document.querySelector('.container');
const allTestsElement = document.querySelector('#all-tests');
const navbar = document.querySelector('#navbar');
const toggleNavbar = document.querySelector('#navbar-toggle');
const closeNavbar = document.querySelector('#close-navbar');

// Iz baze
const testovi = JSON.parse(localStorage.getItem('sviTestovi')) || [];
const testoviB = testovi.filter(test => test.kategorijaTesta === 'B');
const testoviC = testovi.filter(test => test.kategorijaTesta === 'C');
const testoviPrvaPomoć = testovi.filter(test => test.kategorijaTesta === 'Prva_pomoć');
let izabraniTest;
let pitanjaIzabranogTesta = [];
let indeksPitanja = 0;
let aktivniIndeksPitanja = 0;

// Rješavanje testa
const pokreniTest = document.querySelector('#pokreni-test');
const poljeZaTest = document.querySelector('#za-test');
const naslovTesta = document.querySelector('#naslov-testa');
const odgovorenihPitanja = document.querySelector('#header-span');
const napusti = document.querySelector('#napusti-test');
const kontejnerTesta = document.querySelector('#container-testa');
const tekstTrenutnogPitanja = document.querySelector('#trenutno-pitanje');
const poljeZaOdgovore = document.querySelector('#poljeZaOdgovore');
const završiTest = document.querySelector('#završi-test');
const sljedećePitanje = document.querySelector('#naprijed');
const prethodnoPitanje = document.querySelector('#nazad');
let trenutniOdgovori;
let trenutniInputi;
let mojIndeks;
let sakupljenoBodova = 0;

form.addEventListener('submit', e => {
  e.preventDefault();
  provjeraImena();
  postavljanjeImena();
  dodajKlikTestovima();
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

function provjeraImena() {
  let korisničkoIme = nameInput.value.trim();
  if(!korisničkoIme) prikazGreške();
}

function prikazGreške() {
  errorElement.textContent = 'Morate unijeti svoje ime!';
  errorElement.classList.add('error');
}

function postavljanjeImena() {
  if(nameInput.value === '' || nameInput.value === null) return;
  errorElement.style.display = 'none';
  form.style.display = 'none';
  currentUser.style.display = 'block';
  currentUser.textContent = nameInput.value;
}

poredajTestove(testoviB, testsBElement);
poredajTestove(testoviC, testsCElement);
poredajTestove(testoviPrvaPomoć, testsFirstAidElement);

function poredajTestove(nizTestova, polje) {
  nizTestova.map(test => {
    let jedanTest = document.createElement('div');
    jedanTest.classList.add(`test`, `test${test.kategorijaTesta}`);
    jedanTest.textContent = test.nazivTesta;
    polje.appendChild(jedanTest);
  });
}

allTestsElement.addEventListener('click', () => {
  if(form.style.display !== 'none') prikazGreške();
});

function dodajKlikTestovima() {
  const ukupnoSviPrikazaniTestovi = document.querySelectorAll('.test');
  ukupnoSviPrikazaniTestovi.forEach(test => {
    test.addEventListener('click', e => {
      if(currentUser.textContent === '') return;
      allTestsElement.style.display = 'none';
      pokreniTest.style.display = 'block';
      testovi.forEach(jedanTest => {
        if(jedanTest.nazivTesta === e.target.textContent) {
          izabraniTest = jedanTest;
          pitanjaIzabranogTesta = izabraniTest.spisakPitanja;
        }
      });
    });
  });
}

pokreniTest.addEventListener('click', e => {
  e.target.style.display = 'none';
  postaviStrukturuTesta(izabraniTest, pitanjaIzabranogTesta);
  prikazKomandiTesta();
});

function prikazKomandiTesta() {
  poljeZaTest.style.display = 'block';
  sljedećePitanje.classList.add('prikaži');
  prethodnoPitanje.classList.add('prikaži');
}

function postaviStrukturuTesta(mojTest, listaPitanja) {
  poljeZaOdgovore.innerHTML = '';
  naslovTesta.textContent = mojTest.nazivTesta;
  odgovorenihPitanja.textContent = `${indeksPitanja + 1}/${pitanjaIzabranogTesta.length}`;
  let trenutnoPitanje = listaPitanja[indeksPitanja];
  tekstTrenutnogPitanja.textContent = trenutnoPitanje.tekst;
  poljeZaOdgovore.classList.add('polje-odgovora');
  trenutniOdgovori = trenutnoPitanje.odgovori;
  poredajOdgovore(trenutniOdgovori, poljeZaOdgovore);
  kontejnerTesta.appendChild(tekstTrenutnogPitanja);
  kontejnerTesta.appendChild(poljeZaOdgovore);
  provjeriIndekse();  
}

function provjeriIndekse() {
  if(indeksPitanja < aktivniIndeksPitanja) {
    trenutniInputi = kontejnerTesta.querySelectorAll('[type="checkbox"]');
    trenutniInputi.forEach(input => {
      input.disabled = true;      
      const trenutniLabeli = kontejnerTesta.querySelectorAll('label');
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

napusti.addEventListener('click', () => {
  window.location.reload();
});

function dodajOdgovore() {
  const { vrijednostTrenutnogPitanja, sviTačni } = izvuciVrijednostPitanja();
  const izabraniOdgovori = izvuciIzabraneOdgovore();
  obračunajBodove(sviTačni, izabraniOdgovori, vrijednostTrenutnogPitanja);
}

function izvuciVrijednostPitanja() {
  const mojaPitanja = [...izabraniTest.spisakPitanja];
  let trenutnoPitanje = mojaPitanja[indeksPitanja];
  const vrijednostTrenutnogPitanja = parseInt(trenutnoPitanje.vrijednostPitanja);
  let sviTačni = [];
  trenutnoPitanje.odgovori.map(elem => (elem.tačno) ? sviTačni.push(elem.tačno) : null);
  return {
    vrijednostTrenutnogPitanja: vrijednostTrenutnogPitanja,
    sviTačni: sviTačni
  }
}

function izvuciIzabraneOdgovore() {
  trenutniInputi = kontejnerTesta.querySelectorAll('[type="checkbox"]');
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
  if((indeksPitanja + 1) >= pitanjaIzabranogTesta.length) {
    završiTest.style.display = 'block';
    e.target.disabled = true;
    prethodnoPitanje.disabled = true;
    return;
  }
  kontejnerTesta.innerHTML = '';
  (indeksPitanja !== aktivniIndeksPitanja) ? indeksPitanja++ : povećajObaIndeksa();
  postaviStrukturuTesta(izabraniTest, pitanjaIzabranogTesta);
});

function povećajObaIndeksa() {
  indeksPitanja++;
  aktivniIndeksPitanja++;
}

prethodnoPitanje.addEventListener('click', () => {
  if((indeksPitanja) <= 0) return;
  trenutniInputi = kontejnerTesta.querySelectorAll('[type="checkbox"]');
  kontejnerTesta.innerHTML = '';
  indeksPitanja--;
  postaviStrukturuTesta(izabraniTest, pitanjaIzabranogTesta);
});

završiTest.addEventListener('click', e => {
  const tasteri = document.querySelector('#tasteri-za-test');
  tasteri.style.display = 'none';
  poljeZaTest.style.display = 'none';
  izračunajPrikažiRezultat();
});

function izračunajPrikažiRezultat() {
  let ukupnoBodova = izabraniTest.spisakPitanja.map(pitanje => parseInt(pitanje.vrijednostPitanja)).reduce((acc, inc) => acc + inc);
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