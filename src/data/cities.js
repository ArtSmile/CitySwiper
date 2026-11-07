const RAW_COUNTRIES_CATALOG = [
  {
    code: 'AU',
    name: 'Австралия',
    queryName: 'Australia',
    cities: [
      { name: 'Сидней', queryName: 'Sydney' },
      { name: 'Мельбурн', queryName: 'Melbourne' },
      { name: 'Брисбен', queryName: 'Brisbane' },
      { name: 'Перт', queryName: 'Perth' },
      { name: 'Аделаида', queryName: 'Adelaide' },
      { name: 'Канберра', queryName: 'Canberra' },
    ],
  },
  {
    code: 'AT',
    name: 'Австрия',
    queryName: 'Austria',
    cities: [
      { name: 'Вена', queryName: 'Vienna' },
      { name: 'Зальцбург', queryName: 'Salzburg' },
      { name: 'Грац', queryName: 'Graz' },
      { name: 'Инсбрук', queryName: 'Innsbruck' },
      { name: 'Линц', queryName: 'Linz' },
    ],
  },
  {
    code: 'AZ',
    name: 'Азербайджан',
    queryName: 'Azerbaijan',
    cities: [
      { name: 'Баку', queryName: 'Baku' },
      { name: 'Гянджа', queryName: 'Ganja' },
      { name: 'Шеки', queryName: 'Sheki' },
      { name: 'Габала', queryName: 'Gabala' },
    ],
  },
  {
    code: 'AL',
    name: 'Албания',
    queryName: 'Albania',
    cities: [
      { name: 'Тирана', queryName: 'Tirana' },
      { name: 'Дуррес', queryName: 'Durres' },
      { name: 'Влёра', queryName: 'Vlore' },
      { name: 'Саранда', queryName: 'Saranda' },
      { name: 'Шкодер', queryName: 'Shkoder' },
    ],
  },
  {
    code: 'DZ',
    name: 'Алжир',
    queryName: 'Algeria',
    cities: [
      { name: 'Алжир', queryName: 'Algiers' },
      { name: 'Оран', queryName: 'Oran' },
      { name: 'Константина', queryName: 'Constantine' },
    ],
  },
  {
    code: 'AO',
    name: 'Ангола',
    queryName: 'Angola',
    cities: [
      { name: 'Луанда', queryName: 'Luanda' },
      { name: 'Бенгела', queryName: 'Benguela' },
      { name: 'Лубанго', queryName: 'Lubango' },
    ],
  },
  {
    code: 'AD',
    name: 'Андорра',
    queryName: 'Andorra',
    cities: [
      { name: 'Андорра-ла-Велья', queryName: 'Andorra la Vella' },
      { name: 'Эскальдес-Энгордань', queryName: 'Escaldes-Engordany' },
      { name: 'Сольдеу', queryName: 'Soldeu' },
    ],
  },
  {
    code: 'AG',
    name: 'Антигуа и Барбуда',
    queryName: 'Antigua and Barbuda',
    cities: [{ name: 'Сент-Джонс', queryName: "St. John's" }],
  },
  {
    code: 'AR',
    name: 'Аргентина',
    queryName: 'Argentina',
    cities: [
      { name: 'Буэнос-Айрес', queryName: 'Buenos Aires' },
      { name: 'Кордова', queryName: 'Cordoba' },
      { name: 'Мендоса', queryName: 'Mendoza' },
      { name: 'Росарио', queryName: 'Rosario' },
      { name: 'Барилоче', queryName: 'Bariloche' },
    ],
  },
  {
    code: 'AM',
    name: 'Армения',
    queryName: 'Armenia',
    cities: [
      { name: 'Ереван', queryName: 'Yerevan' },
      { name: 'Гюмри', queryName: 'Gyumri' },
      { name: 'Дилижан', queryName: 'Dilijan' },
      { name: 'Цахкадзор', queryName: 'Tsaghkadzor' },
    ],
  },
  {
    code: 'AF',
    name: 'Афганистан',
    queryName: 'Afghanistan',
    cities: [
      { name: 'Кабул', queryName: 'Kabul' },
      { name: 'Герат', queryName: 'Herat' },
      { name: 'Мазари-Шариф', queryName: 'Mazar-i-Sharif' },
    ],
  },
  {
    code: 'BS',
    name: 'Багамы',
    queryName: 'Bahamas',
    cities: [
      { name: 'Нассау', queryName: 'Nassau' },
      { name: 'Фрипорт', queryName: 'Freeport' },
    ],
  },
  {
    code: 'BD',
    name: 'Бангладеш',
    queryName: 'Bangladesh',
    cities: [
      { name: 'Дакка', queryName: 'Dhaka' },
      { name: 'Читтагонг', queryName: 'Chittagong' },
      { name: 'Силхет', queryName: 'Sylhet' },
    ],
  },
  {
    code: 'BB',
    name: 'Барбадос',
    queryName: 'Barbados',
    cities: [{ name: 'Бриджтаун', queryName: 'Bridgetown' }],
  },
  {
    code: 'BH',
    name: 'Бахрейн',
    queryName: 'Bahrain',
    cities: [
      { name: 'Манама', queryName: 'Manama' },
      { name: 'Мухаррак', queryName: 'Muharraq' },
    ],
  },
  {
    code: 'BY',
    name: 'Беларусь',
    queryName: 'Belarus',
    aliases: ['Белоруссия'],
    cities: [
      { name: 'Минск', queryName: 'Minsk' },
      { name: 'Брест', queryName: 'Brest' },
      { name: 'Гродно', queryName: 'Grodno' },
      { name: 'Гомель', queryName: 'Gomel' },
      { name: 'Витебск', queryName: 'Vitebsk' },
    ],
  },
  {
    code: 'BZ',
    name: 'Белиз',
    queryName: 'Belize',
    cities: [
      { name: 'Белиз-Сити', queryName: 'Belize City' },
      { name: 'Сан-Педро', queryName: 'San Pedro' },
      { name: 'Бельмопан', queryName: 'Belmopan' },
    ],
  },
  {
    code: 'BE',
    name: 'Бельгия',
    queryName: 'Belgium',
    cities: [
      { name: 'Брюссель', queryName: 'Brussels' },
      { name: 'Антверпен', queryName: 'Antwerp' },
      { name: 'Гент', queryName: 'Ghent' },
      { name: 'Брюгге', queryName: 'Bruges' },
      { name: 'Лёвен', queryName: 'Leuven' },
    ],
  },
  {
    code: 'BJ',
    name: 'Бенин',
    queryName: 'Benin',
    cities: [
      { name: 'Котону', queryName: 'Cotonou' },
      { name: 'Порто-Ново', queryName: 'Porto-Novo' },
    ],
  },
  {
    code: 'BG',
    name: 'Болгария',
    queryName: 'Bulgaria',
    cities: [
      { name: 'София', queryName: 'Sofia' },
      { name: 'Пловдив', queryName: 'Plovdiv' },
      { name: 'Варна', queryName: 'Varna' },
      { name: 'Бургас', queryName: 'Burgas' },
      { name: 'Банско', queryName: 'Bansko' },
    ],
  },
  {
    code: 'BO',
    name: 'Боливия',
    queryName: 'Bolivia',
    cities: [
      { name: 'Ла-Пас', queryName: 'La Paz' },
      { name: 'Санта-Крус-де-ла-Сьерра', queryName: 'Santa Cruz de la Sierra' },
      { name: 'Сукре', queryName: 'Sucre' },
    ],
  },
  {
    code: 'BA',
    name: 'Босния и Герцеговина',
    queryName: 'Bosnia and Herzegovina',
    cities: [
      { name: 'Сараево', queryName: 'Sarajevo' },
      { name: 'Мостар', queryName: 'Mostar' },
      { name: 'Баня-Лука', queryName: 'Banja Luka' },
    ],
  },
  {
    code: 'BW',
    name: 'Ботсвана',
    queryName: 'Botswana',
    cities: [
      { name: 'Габороне', queryName: 'Gaborone' },
      { name: 'Маун', queryName: 'Maun' },
    ],
  },
  {
    code: 'BR',
    name: 'Бразилия',
    queryName: 'Brazil',
    cities: [
      { name: 'Сан-Паулу', queryName: 'Sao Paulo' },
      { name: 'Рио-де-Жанейро', queryName: 'Rio de Janeiro' },
      { name: 'Бразилиа', queryName: 'Brasilia' },
      { name: 'Флорианополис', queryName: 'Florianopolis' },
      { name: 'Салвадор', queryName: 'Salvador' },
    ],
  },
  {
    code: 'BN',
    name: 'Бруней',
    queryName: 'Brunei',
    cities: [{ name: 'Бандар-Сери-Бегаван', queryName: 'Bandar Seri Begawan' }],
  },
  {
    code: 'BF',
    name: 'Буркина-Фасо',
    queryName: 'Burkina Faso',
    cities: [
      { name: 'Уагадугу', queryName: 'Ouagadougou' },
      { name: 'Бобо-Диуласо', queryName: 'Bobo-Dioulasso' },
    ],
  },
  {
    code: 'BI',
    name: 'Бурунди',
    queryName: 'Burundi',
    cities: [
      { name: 'Бужумбура', queryName: 'Bujumbura' },
      { name: 'Гитега', queryName: 'Gitega' },
    ],
  },
  {
    code: 'BT',
    name: 'Бутан',
    queryName: 'Bhutan',
    cities: [
      { name: 'Тхимпху', queryName: 'Thimphu' },
      { name: 'Паро', queryName: 'Paro' },
    ],
  },
  {
    code: 'VU',
    name: 'Вануату',
    queryName: 'Vanuatu',
    cities: [{ name: 'Порт-Вила', queryName: 'Port Vila' }],
  },
  {
    code: 'VA',
    name: 'Ватикан',
    queryName: 'Vatican City',
    cities: [{ name: 'Ватикан', queryName: 'Vatican City' }],
  },
  {
    code: 'GB',
    name: 'Великобритания',
    queryName: 'United Kingdom',
    aliases: ['Англия', 'Британия', 'UK', 'Great Britain'],
    cities: [
      { name: 'Лондон', queryName: 'London' },
      { name: 'Эдинбург', queryName: 'Edinburgh' },
      { name: 'Манчестер', queryName: 'Manchester' },
      { name: 'Бристоль', queryName: 'Bristol' },
      { name: 'Глазго', queryName: 'Glasgow' },
      { name: 'Ливерпуль', queryName: 'Liverpool' },
    ],
  },
  {
    code: 'HU',
    name: 'Венгрия',
    queryName: 'Hungary',
    cities: [
      { name: 'Будапешт', queryName: 'Budapest' },
      { name: 'Дебрецен', queryName: 'Debrecen' },
      { name: 'Сегед', queryName: 'Szeged' },
      { name: 'Печ', queryName: 'Pecs' },
    ],
  },
  {
    code: 'VE',
    name: 'Венесуэла',
    queryName: 'Venezuela',
    cities: [
      { name: 'Каракас', queryName: 'Caracas' },
      { name: 'Маракайбо', queryName: 'Maracaibo' },
      { name: 'Валенсия', queryName: 'Valencia' },
    ],
  },
  {
    code: 'TL',
    name: 'Восточный Тимор',
    queryName: 'Timor-Leste',
    cities: [{ name: 'Дили', queryName: 'Dili' }],
  },
  {
    code: 'VN',
    name: 'Вьетнам',
    queryName: 'Vietnam',
    cities: [
      { name: 'Хошимин', queryName: 'Ho Chi Minh City' },
      { name: 'Ханой', queryName: 'Hanoi' },
      { name: 'Дананг', queryName: 'Da Nang' },
      { name: 'Хойан', queryName: 'Hoi An' },
      { name: 'Нячанг', queryName: 'Nha Trang' },
    ],
  },
  {
    code: 'GA',
    name: 'Габон',
    queryName: 'Gabon',
    cities: [{ name: 'Либревиль', queryName: 'Libreville' }],
  },
  {
    code: 'HT',
    name: 'Гаити',
    queryName: 'Haiti',
    cities: [{ name: 'Порт-о-Пренс', queryName: 'Port-au-Prince' }],
  },
  {
    code: 'GY',
    name: 'Гайана',
    queryName: 'Guyana',
    cities: [{ name: 'Джорджтаун', queryName: 'Georgetown' }],
  },
  {
    code: 'GM',
    name: 'Гамбия',
    queryName: 'Gambia',
    cities: [
      { name: 'Банжул', queryName: 'Banjul' },
      { name: 'Серекунда', queryName: 'Serekunda' },
    ],
  },
  {
    code: 'GH',
    name: 'Гана',
    queryName: 'Ghana',
    cities: [
      { name: 'Аккра', queryName: 'Accra' },
      { name: 'Кумаси', queryName: 'Kumasi' },
    ],
  },
  {
    code: 'GT',
    name: 'Гватемала',
    queryName: 'Guatemala',
    cities: [
      { name: 'Гватемала', queryName: 'Guatemala City' },
      { name: 'Антигуа-Гватемала', queryName: 'Antigua Guatemala' },
    ],
  },
  {
    code: 'GN',
    name: 'Гвинея',
    queryName: 'Guinea',
    cities: [{ name: 'Конакри', queryName: 'Conakry' }],
  },
  {
    code: 'GW',
    name: 'Гвинея-Бисау',
    queryName: 'Guinea-Bissau',
    cities: [{ name: 'Бисау', queryName: 'Bissau' }],
  },
  {
    code: 'DE',
    name: 'Германия',
    queryName: 'Germany',
    cities: [
      { name: 'Берлин', queryName: 'Berlin' },
      { name: 'Мюнхен', queryName: 'Munich' },
      { name: 'Гамбург', queryName: 'Hamburg' },
      { name: 'Франкфурт', queryName: 'Frankfurt' },
      { name: 'Кёльн', queryName: 'Cologne' },
      { name: 'Дюссельдорф', queryName: 'Dusseldorf' },
    ],
  },
  {
    code: 'HN',
    name: 'Гондурас',
    queryName: 'Honduras',
    cities: [
      { name: 'Тегусигальпа', queryName: 'Tegucigalpa' },
      { name: 'Сан-Педро-Сула', queryName: 'San Pedro Sula' },
    ],
  },
  {
    code: 'HK',
    name: 'Гонконг',
    queryName: 'Hong Kong',
    cities: [{ name: 'Гонконг', queryName: 'Hong Kong' }],
  },
  {
    code: 'GD',
    name: 'Гренада',
    queryName: 'Grenada',
    cities: [{ name: 'Сент-Джорджес', queryName: "St. George's" }],
  },
  {
    code: 'GR',
    name: 'Греция',
    queryName: 'Greece',
    cities: [
      { name: 'Афины', queryName: 'Athens' },
      { name: 'Салоники', queryName: 'Thessaloniki' },
      { name: 'Ираклион', queryName: 'Heraklion' },
      { name: 'Ханья', queryName: 'Chania' },
      { name: 'Родос', queryName: 'Rhodes' },
    ],
  },
  {
    code: 'GE',
    name: 'Грузия',
    queryName: 'Georgia',
    cities: [
      { name: 'Тбилиси', queryName: 'Tbilisi' },
      { name: 'Батуми', queryName: 'Batumi' },
      { name: 'Кутаиси', queryName: 'Kutaisi' },
      { name: 'Сигнахи', queryName: 'Sighnaghi' },
    ],
  },
  {
    code: 'DK',
    name: 'Дания',
    queryName: 'Denmark',
    cities: [
      { name: 'Копенгаген', queryName: 'Copenhagen' },
      { name: 'Орхус', queryName: 'Aarhus' },
      { name: 'Оденсе', queryName: 'Odense' },
      { name: 'Ольборг', queryName: 'Aalborg' },
    ],
  },
  {
    code: 'DJ',
    name: 'Джибути',
    queryName: 'Djibouti',
    cities: [{ name: 'Джибути', queryName: 'Djibouti' }],
  },
  {
    code: 'DM',
    name: 'Доминика',
    queryName: 'Dominica',
    cities: [{ name: 'Розо', queryName: 'Roseau' }],
  },
  {
    code: 'DO',
    name: 'Доминиканская Республика',
    queryName: 'Dominican Republic',
    cities: [
      { name: 'Санто-Доминго', queryName: 'Santo Domingo' },
      { name: 'Пунта-Кана', queryName: 'Punta Cana' },
      { name: 'Сантьяго', queryName: 'Santiago de los Caballeros' },
    ],
  },
  {
    code: 'CD',
    name: 'ДР Конго',
    queryName: 'Democratic Republic of the Congo',
    aliases: ['Демократическая Республика Конго', 'Конго Киншаса'],
    cities: [
      { name: 'Киншаса', queryName: 'Kinshasa' },
      { name: 'Лубумбаши', queryName: 'Lubumbashi' },
    ],
  },
  {
    code: 'EG',
    name: 'Египет',
    queryName: 'Egypt',
    cities: [
      { name: 'Каир', queryName: 'Cairo' },
      { name: 'Александрия', queryName: 'Alexandria' },
      { name: 'Шарм-эль-Шейх', queryName: 'Sharm El Sheikh' },
      { name: 'Хургада', queryName: 'Hurghada' },
      { name: 'Дахаб', queryName: 'Dahab' },
    ],
  },
  {
    code: 'ZM',
    name: 'Замбия',
    queryName: 'Zambia',
    cities: [
      { name: 'Лусака', queryName: 'Lusaka' },
      { name: 'Ливингстон', queryName: 'Livingstone' },
    ],
  },
  {
    code: 'ZW',
    name: 'Зимбабве',
    queryName: 'Zimbabwe',
    cities: [
      { name: 'Хараре', queryName: 'Harare' },
      { name: 'Булавайо', queryName: 'Bulawayo' },
      { name: 'Виктория-Фолс', queryName: 'Victoria Falls' },
    ],
  },
  {
    code: 'IL',
    name: 'Израиль',
    queryName: 'Israel',
    cities: [
      { name: 'Тель-Авив', queryName: 'Tel Aviv' },
      { name: 'Иерусалим', queryName: 'Jerusalem' },
      { name: 'Хайфа', queryName: 'Haifa' },
      { name: 'Эйлат', queryName: 'Eilat' },
    ],
  },
  {
    code: 'IN',
    name: 'Индия',
    queryName: 'India',
    cities: [
      { name: 'Мумбаи', queryName: 'Mumbai' },
      { name: 'Нью-Дели', queryName: 'New Delhi' },
      { name: 'Бангалор', queryName: 'Bengaluru' },
      { name: 'Джайпур', queryName: 'Jaipur' },
      { name: 'Гоа', queryName: 'Panaji' },
    ],
  },
  {
    code: 'ID',
    name: 'Индонезия',
    queryName: 'Indonesia',
    cities: [
      { name: 'Джакарта', queryName: 'Jakarta' },
      { name: 'Денпасар', queryName: 'Denpasar' },
      { name: 'Убуд', queryName: 'Ubud' },
      { name: 'Чангу', queryName: 'Canggu' },
      { name: 'Джокьякарта', queryName: 'Yogyakarta' },
    ],
  },
  {
    code: 'JO',
    name: 'Иордания',
    queryName: 'Jordan',
    cities: [
      { name: 'Амман', queryName: 'Amman' },
      { name: 'Акаба', queryName: 'Aqaba' },
      { name: 'Мадаба', queryName: 'Madaba' },
    ],
  },
  {
    code: 'IQ',
    name: 'Ирак',
    queryName: 'Iraq',
    cities: [
      { name: 'Багдад', queryName: 'Baghdad' },
      { name: 'Эрбиль', queryName: 'Erbil' },
      { name: 'Басра', queryName: 'Basra' },
    ],
  },
  {
    code: 'IR',
    name: 'Иран',
    queryName: 'Iran',
    cities: [
      { name: 'Тегеран', queryName: 'Tehran' },
      { name: 'Исфахан', queryName: 'Isfahan' },
      { name: 'Шираз', queryName: 'Shiraz' },
    ],
  },
  {
    code: 'IE',
    name: 'Ирландия',
    queryName: 'Ireland',
    cities: [
      { name: 'Дублин', queryName: 'Dublin' },
      { name: 'Корк', queryName: 'Cork' },
      { name: 'Голуэй', queryName: 'Galway' },
    ],
  },
  {
    code: 'IS',
    name: 'Исландия',
    queryName: 'Iceland',
    cities: [
      { name: 'Рейкьявик', queryName: 'Reykjavik' },
      { name: 'Акюрейри', queryName: 'Akureyri' },
      { name: 'Кефлавик', queryName: 'Keflavik' },
    ],
  },
  {
    code: 'ES',
    name: 'Испания',
    queryName: 'Spain',
    cities: [
      { name: 'Барселона', queryName: 'Barcelona' },
      { name: 'Мадрид', queryName: 'Madrid' },
      { name: 'Валенсия', queryName: 'Valencia' },
      { name: 'Севилья', queryName: 'Seville' },
      { name: 'Малага', queryName: 'Malaga' },
      { name: 'Сан-Себастьян', queryName: 'San Sebastian' },
      { name: 'Бильбао', queryName: 'Bilbao' },
    ],
  },
  {
    code: 'IT',
    name: 'Италия',
    queryName: 'Italy',
    cities: [
      { name: 'Рим', queryName: 'Rome' },
      { name: 'Милан', queryName: 'Milan' },
      { name: 'Флоренция', queryName: 'Florence' },
      { name: 'Неаполь', queryName: 'Naples' },
      { name: 'Болонья', queryName: 'Bologna' },
      { name: 'Венеция', queryName: 'Venice' },
      { name: 'Турин', queryName: 'Turin' },
    ],
  },
  {
    code: 'YE',
    name: 'Йемен',
    queryName: 'Yemen',
    cities: [
      { name: 'Сана', queryName: 'Sanaa' },
      { name: 'Аден', queryName: 'Aden' },
    ],
  },
  {
    code: 'CV',
    name: 'Кабо-Верде',
    queryName: 'Cape Verde',
    cities: [
      { name: 'Прая', queryName: 'Praia' },
      { name: 'Минделу', queryName: 'Mindelo' },
      { name: 'Санта-Мария', queryName: 'Santa Maria' },
    ],
  },
  {
    code: 'KZ',
    name: 'Казахстан',
    queryName: 'Kazakhstan',
    cities: [
      { name: 'Алматы', queryName: 'Almaty' },
      { name: 'Астана', queryName: 'Astana' },
      { name: 'Шымкент', queryName: 'Shymkent' },
      { name: 'Актау', queryName: 'Aktau' },
    ],
  },
  {
    code: 'KH',
    name: 'Камбоджа',
    queryName: 'Cambodia',
    cities: [
      { name: 'Пномпень', queryName: 'Phnom Penh' },
      { name: 'Сиемреап', queryName: 'Siem Reap' },
      { name: 'Сиануквиль', queryName: 'Sihanoukville' },
    ],
  },
  {
    code: 'CM',
    name: 'Камерун',
    queryName: 'Cameroon',
    cities: [
      { name: 'Дуала', queryName: 'Douala' },
      { name: 'Яунде', queryName: 'Yaounde' },
    ],
  },
  {
    code: 'CA',
    name: 'Канада',
    queryName: 'Canada',
    cities: [
      { name: 'Торонто', queryName: 'Toronto' },
      { name: 'Монреаль', queryName: 'Montreal' },
      { name: 'Ванкувер', queryName: 'Vancouver' },
      { name: 'Калгари', queryName: 'Calgary' },
      { name: 'Оттава', queryName: 'Ottawa' },
    ],
  },
  {
    code: 'QA',
    name: 'Катар',
    queryName: 'Qatar',
    cities: [
      { name: 'Доха', queryName: 'Doha' },
      { name: 'Лусаил', queryName: 'Lusail' },
    ],
  },
  {
    code: 'KE',
    name: 'Кения',
    queryName: 'Kenya',
    cities: [
      { name: 'Найроби', queryName: 'Nairobi' },
      { name: 'Момбаса', queryName: 'Mombasa' },
    ],
  },
  {
    code: 'CY',
    name: 'Кипр',
    queryName: 'Cyprus',
    cities: [
      { name: 'Лимассол', queryName: 'Limassol' },
      { name: 'Никосия', queryName: 'Nicosia' },
      { name: 'Пафос', queryName: 'Paphos' },
      { name: 'Ларнака', queryName: 'Larnaca' },
      { name: 'Айя-Напа', queryName: 'Ayia Napa' },
    ],
  },
  {
    code: 'KG',
    name: 'Киргизия',
    queryName: 'Kyrgyzstan',
    aliases: ['Кыргызстан'],
    cities: [
      { name: 'Бишкек', queryName: 'Bishkek' },
      { name: 'Ош', queryName: 'Osh' },
      { name: 'Каракол', queryName: 'Karakol' },
    ],
  },
  {
    code: 'KI',
    name: 'Кирибати',
    queryName: 'Kiribati',
    cities: [{ name: 'Южная Тарава', queryName: 'South Tarawa' }],
  },
  {
    code: 'CN',
    name: 'Китай',
    queryName: 'China',
    cities: [
      { name: 'Шанхай', queryName: 'Shanghai' },
      { name: 'Пекин', queryName: 'Beijing' },
      { name: 'Шэньчжэнь', queryName: 'Shenzhen' },
      { name: 'Гуанчжоу', queryName: 'Guangzhou' },
      { name: 'Чэнду', queryName: 'Chengdu' },
    ],
  },
  {
    code: 'CO',
    name: 'Колумбия',
    queryName: 'Colombia',
    cities: [
      { name: 'Богота', queryName: 'Bogota' },
      { name: 'Медельин', queryName: 'Medellin' },
      { name: 'Картахена', queryName: 'Cartagena' },
      { name: 'Кали', queryName: 'Cali' },
    ],
  },
  {
    code: 'KM',
    name: 'Коморы',
    queryName: 'Comoros',
    cities: [{ name: 'Морони', queryName: 'Moroni' }],
  },
  {
    code: 'XK',
    name: 'Косово',
    queryName: 'Kosovo',
    cities: [
      { name: 'Приштина', queryName: 'Pristina' },
      { name: 'Призрен', queryName: 'Prizren' },
    ],
  },
  {
    code: 'CR',
    name: 'Коста-Рика',
    queryName: 'Costa Rica',
    cities: [
      { name: 'Сан-Хосе', queryName: 'San Jose' },
      { name: 'Тамариндо', queryName: 'Tamarindo' },
      { name: 'Ла-Фортуна', queryName: 'La Fortuna' },
    ],
  },
  {
    code: 'CI',
    name: "Кот-д'Ивуар",
    queryName: 'Ivory Coast',
    aliases: ['Кот-д’Ивуар', "Cote d'Ivoire"],
    cities: [
      { name: 'Абиджан', queryName: 'Abidjan' },
      { name: 'Ямусукро', queryName: 'Yamoussoukro' },
    ],
  },
  {
    code: 'CU',
    name: 'Куба',
    queryName: 'Cuba',
    cities: [
      { name: 'Гавана', queryName: 'Havana' },
      { name: 'Варадеро', queryName: 'Varadero' },
      { name: 'Тринидад', queryName: 'Trinidad' },
    ],
  },
  {
    code: 'KW',
    name: 'Кувейт',
    queryName: 'Kuwait',
    cities: [{ name: 'Эль-Кувейт', queryName: 'Kuwait City' }],
  },
  {
    code: 'LA',
    name: 'Лаос',
    queryName: 'Laos',
    cities: [
      { name: 'Вьентьян', queryName: 'Vientiane' },
      { name: 'Луангпхабанг', queryName: 'Luang Prabang' },
    ],
  },
  {
    code: 'LV',
    name: 'Латвия',
    queryName: 'Latvia',
    cities: [
      { name: 'Рига', queryName: 'Riga' },
      { name: 'Юрмала', queryName: 'Jurmala' },
      { name: 'Лиепая', queryName: 'Liepaja' },
      { name: 'Цесис', queryName: 'Cesis' },
    ],
  },
  {
    code: 'LS',
    name: 'Лесото',
    queryName: 'Lesotho',
    cities: [{ name: 'Масеру', queryName: 'Maseru' }],
  },
  {
    code: 'LR',
    name: 'Либерия',
    queryName: 'Liberia',
    cities: [{ name: 'Монровия', queryName: 'Monrovia' }],
  },
  {
    code: 'LB',
    name: 'Ливан',
    queryName: 'Lebanon',
    cities: [
      { name: 'Бейрут', queryName: 'Beirut' },
      { name: 'Библос', queryName: 'Byblos' },
      { name: 'Батрун', queryName: 'Batroun' },
    ],
  },
  {
    code: 'LY',
    name: 'Ливия',
    queryName: 'Libya',
    cities: [
      { name: 'Триполи', queryName: 'Tripoli' },
      { name: 'Бенгази', queryName: 'Benghazi' },
    ],
  },
  {
    code: 'LT',
    name: 'Литва',
    queryName: 'Lithuania',
    cities: [
      { name: 'Вильнюс', queryName: 'Vilnius' },
      { name: 'Каунас', queryName: 'Kaunas' },
      { name: 'Клайпеда', queryName: 'Klaipeda' },
      { name: 'Паланга', queryName: 'Palanga' },
      { name: 'Тракай', queryName: 'Trakai' },
      { name: 'Друскининкай', queryName: 'Druskininkai' },
      { name: 'Шяуляй', queryName: 'Siauliai' },
    ],
  },
  {
    code: 'LI',
    name: 'Лихтенштейн',
    queryName: 'Liechtenstein',
    cities: [
      { name: 'Вадуц', queryName: 'Vaduz' },
      { name: 'Шан', queryName: 'Schaan' },
    ],
  },
  {
    code: 'LU',
    name: 'Люксембург',
    queryName: 'Luxembourg',
    cities: [
      { name: 'Люксембург', queryName: 'Luxembourg City' },
      { name: 'Эш-сюр-Альзетт', queryName: 'Esch-sur-Alzette' },
    ],
  },
  {
    code: 'MU',
    name: 'Маврикий',
    queryName: 'Mauritius',
    cities: [
      { name: 'Порт-Луи', queryName: 'Port Louis' },
      { name: 'Гран-Бэ', queryName: 'Grand Baie' },
      { name: 'Флик-ан-Флак', queryName: 'Flic en Flac' },
    ],
  },
  {
    code: 'MR',
    name: 'Мавритания',
    queryName: 'Mauritania',
    cities: [{ name: 'Нуакшот', queryName: 'Nouakchott' }],
  },
  {
    code: 'MG',
    name: 'Мадагаскар',
    queryName: 'Madagascar',
    cities: [
      { name: 'Антананариву', queryName: 'Antananarivo' },
      { name: 'Нуси-Бе', queryName: 'Nosy Be' },
    ],
  },
  {
    code: 'MO',
    name: 'Макао',
    queryName: 'Macau',
    cities: [{ name: 'Макао', queryName: 'Macau' }],
  },
  {
    code: 'MW',
    name: 'Малави',
    queryName: 'Malawi',
    cities: [
      { name: 'Лилонгве', queryName: 'Lilongwe' },
      { name: 'Блантайр', queryName: 'Blantyre' },
    ],
  },
  {
    code: 'MY',
    name: 'Малайзия',
    queryName: 'Malaysia',
    cities: [
      { name: 'Куала-Лумпур', queryName: 'Kuala Lumpur' },
      { name: 'Джорджтаун', queryName: 'George Town' },
      { name: 'Кота-Кинабалу', queryName: 'Kota Kinabalu' },
      { name: 'Джохор-Бару', queryName: 'Johor Bahru' },
    ],
  },
  {
    code: 'ML',
    name: 'Мали',
    queryName: 'Mali',
    cities: [{ name: 'Бамако', queryName: 'Bamako' }],
  },
  {
    code: 'MV',
    name: 'Мальдивы',
    queryName: 'Maldives',
    cities: [
      { name: 'Мале', queryName: 'Male' },
      { name: 'Хулхумале', queryName: 'Hulhumale' },
    ],
  },
  {
    code: 'MT',
    name: 'Мальта',
    queryName: 'Malta',
    cities: [
      { name: 'Валлетта', queryName: 'Valletta' },
      { name: 'Слима', queryName: 'Sliema' },
      { name: 'Сент-Джулианс', queryName: "St. Julian's" },
    ],
  },
  {
    code: 'MA',
    name: 'Марокко',
    queryName: 'Morocco',
    cities: [
      { name: 'Марракеш', queryName: 'Marrakesh' },
      { name: 'Касабланка', queryName: 'Casablanca' },
      { name: 'Рабат', queryName: 'Rabat' },
      { name: 'Танжер', queryName: 'Tangier' },
      { name: 'Фес', queryName: 'Fes' },
    ],
  },
  {
    code: 'MH',
    name: 'Маршалловы Острова',
    queryName: 'Marshall Islands',
    cities: [{ name: 'Маджуро', queryName: 'Majuro' }],
  },
  {
    code: 'MX',
    name: 'Мексика',
    queryName: 'Mexico',
    cities: [
      { name: 'Мехико', queryName: 'Mexico City' },
      { name: 'Гвадалахара', queryName: 'Guadalajara' },
      { name: 'Монтеррей', queryName: 'Monterrey' },
      { name: 'Канкун', queryName: 'Cancun' },
      { name: 'Оахака', queryName: 'Oaxaca' },
    ],
  },
  {
    code: 'FM',
    name: 'Микронезия',
    queryName: 'Micronesia',
    aliases: ['Федеративные Штаты Микронезии'],
    cities: [{ name: 'Паликир', queryName: 'Palikir' }],
  },
  {
    code: 'MZ',
    name: 'Мозамбик',
    queryName: 'Mozambique',
    cities: [{ name: 'Мапуту', queryName: 'Maputo' }],
  },
  {
    code: 'MD',
    name: 'Молдова',
    queryName: 'Moldova',
    aliases: ['Молдавия'],
    cities: [
      { name: 'Кишинёв', queryName: 'Chisinau' },
      { name: 'Бельцы', queryName: 'Balti' },
    ],
  },
  {
    code: 'MC',
    name: 'Монако',
    queryName: 'Monaco',
    cities: [
      { name: 'Монако', queryName: 'Monaco' },
      { name: 'Монте-Карло', queryName: 'Monte Carlo' },
    ],
  },
  {
    code: 'MN',
    name: 'Монголия',
    queryName: 'Mongolia',
    cities: [{ name: 'Улан-Батор', queryName: 'Ulaanbaatar' }],
  },
  {
    code: 'MM',
    name: 'Мьянма',
    queryName: 'Myanmar',
    aliases: ['Бирма', 'Burma'],
    cities: [
      { name: 'Янгон', queryName: 'Yangon' },
      { name: 'Мандалай', queryName: 'Mandalay' },
    ],
  },
  {
    code: 'NA',
    name: 'Намибия',
    queryName: 'Namibia',
    cities: [
      { name: 'Виндхук', queryName: 'Windhoek' },
      { name: 'Свакопмунд', queryName: 'Swakopmund' },
    ],
  },
  {
    code: 'NR',
    name: 'Науру',
    queryName: 'Nauru',
    cities: [{ name: 'Ярен', queryName: 'Yaren' }],
  },
  {
    code: 'NP',
    name: 'Непал',
    queryName: 'Nepal',
    cities: [
      { name: 'Катманду', queryName: 'Kathmandu' },
      { name: 'Покхара', queryName: 'Pokhara' },
    ],
  },
  {
    code: 'NE',
    name: 'Нигер',
    queryName: 'Niger',
    cities: [{ name: 'Ниамей', queryName: 'Niamey' }],
  },
  {
    code: 'NG',
    name: 'Нигерия',
    queryName: 'Nigeria',
    cities: [
      { name: 'Лагос', queryName: 'Lagos' },
      { name: 'Абуджа', queryName: 'Abuja' },
    ],
  },
  {
    code: 'NL',
    name: 'Нидерланды',
    queryName: 'Netherlands',
    aliases: ['Голландия', 'Holland'],
    cities: [
      { name: 'Амстердам', queryName: 'Amsterdam' },
      { name: 'Роттердам', queryName: 'Rotterdam' },
      { name: 'Утрехт', queryName: 'Utrecht' },
      { name: 'Гаага', queryName: 'The Hague' },
      { name: 'Эйндховен', queryName: 'Eindhoven' },
    ],
  },
  {
    code: 'NI',
    name: 'Никарагуа',
    queryName: 'Nicaragua',
    cities: [
      { name: 'Манагуа', queryName: 'Managua' },
      { name: 'Гранада', queryName: 'Granada' },
    ],
  },
  {
    code: 'NZ',
    name: 'Новая Зеландия',
    queryName: 'New Zealand',
    cities: [
      { name: 'Окленд', queryName: 'Auckland' },
      { name: 'Веллингтон', queryName: 'Wellington' },
      { name: 'Крайстчерч', queryName: 'Christchurch' },
      { name: 'Квинстаун', queryName: 'Queenstown' },
    ],
  },
  {
    code: 'NO',
    name: 'Норвегия',
    queryName: 'Norway',
    cities: [
      { name: 'Осло', queryName: 'Oslo' },
      { name: 'Берген', queryName: 'Bergen' },
      { name: 'Тронхейм', queryName: 'Trondheim' },
      { name: 'Ставангер', queryName: 'Stavanger' },
      { name: 'Тромсё', queryName: 'Tromso' },
    ],
  },
  {
    code: 'AE',
    name: 'ОАЭ',
    queryName: 'United Arab Emirates',
    aliases: ['Объединённые Арабские Эмираты', 'Объединенные Арабские Эмираты', 'Эмираты', 'UAE'],
    cities: [
      { name: 'Дубай', queryName: 'Dubai' },
      { name: 'Абу-Даби', queryName: 'Abu Dhabi' },
      { name: 'Шарджа', queryName: 'Sharjah' },
      { name: 'Рас-эль-Хайма', queryName: 'Ras Al Khaimah' },
    ],
  },
  {
    code: 'OM',
    name: 'Оман',
    queryName: ' Oman',
    cities: [
      { name: 'Маскат', queryName: 'Muscat' },
      { name: 'Салала', queryName: 'Salalah' },
      { name: 'Низва', queryName: 'Nizwa' },
    ],
  },
  {
    code: 'PK',
    name: 'Пакистан',
    queryName: 'Pakistan',
    cities: [
      { name: 'Карачи', queryName: 'Karachi' },
      { name: 'Лахор', queryName: 'Lahore' },
      { name: 'Исламабад', queryName: 'Islamabad' },
    ],
  },
  {
    code: 'PW',
    name: 'Палау',
    queryName: 'Palau',
    cities: [{ name: 'Корор', queryName: 'Koror' }],
  },
  {
    code: 'PS',
    name: 'Палестина',
    queryName: 'Palestine',
    cities: [
      { name: 'Рамалла', queryName: 'Ramallah' },
      { name: 'Вифлеем', queryName: 'Bethlehem' },
    ],
  },
  {
    code: 'PA',
    name: 'Панама',
    queryName: 'Panama',
    cities: [
      { name: 'Панама', queryName: 'Panama City' },
      { name: 'Бокете', queryName: 'Boquete' },
    ],
  },
  {
    code: 'PG',
    name: 'Папуа - Новая Гвинея',
    queryName: 'Papua New Guinea',
    cities: [{ name: 'Порт-Морсби', queryName: 'Port Moresby' }],
  },
  {
    code: 'PY',
    name: 'Парагвай',
    queryName: 'Paraguay',
    cities: [
      { name: 'Асунсьон', queryName: 'Asuncion' },
      { name: 'Сьюдад-дель-Эсте', queryName: 'Ciudad del Este' },
    ],
  },
  {
    code: 'PE',
    name: 'Перу',
    queryName: 'Peru',
    cities: [
      { name: 'Лима', queryName: 'Lima' },
      { name: 'Куско', queryName: 'Cusco' },
      { name: 'Арекипа', queryName: 'Arequipa' },
    ],
  },
  {
    code: 'PL',
    name: 'Польша',
    queryName: 'Poland',
    cities: [
      { name: 'Варшава', queryName: 'Warsaw' },
      { name: 'Краков', queryName: 'Krakow' },
      { name: 'Гданьск', queryName: 'Gdansk' },
      { name: 'Вроцлав', queryName: 'Wroclaw' },
      { name: 'Познань', queryName: 'Poznan' },
    ],
  },
  {
    code: 'PT',
    name: 'Португалия',
    queryName: 'Portugal',
    cities: [
      { name: 'Лиссабон', queryName: 'Lisbon' },
      { name: 'Порту', queryName: 'Porto' },
      { name: 'Фару', queryName: 'Faro' },
      { name: 'Кашкайш', queryName: 'Cascais' },
      { name: 'Фуншал', queryName: 'Funchal' },
    ],
  },
  {
    code: 'PR',
    name: 'Пуэрто-Рико',
    queryName: 'Puerto Rico',
    cities: [{ name: 'Сан-Хуан', queryName: 'San Juan' }],
  },
  {
    code: 'CG',
    name: 'Республика Конго',
    queryName: 'Republic of the Congo',
    aliases: ['Конго Браззавиль'],
    cities: [
      { name: 'Браззавиль', queryName: 'Brazzaville' },
      { name: 'Пуэнт-Нуар', queryName: 'Pointe-Noire' },
    ],
  },
  {
    code: 'RU',
    name: 'Россия',
    queryName: 'Russia',
    cities: [
      { name: 'Москва', queryName: 'Moscow' },
      { name: 'Санкт-Петербург', queryName: 'Saint Petersburg' },
      { name: 'Казань', queryName: 'Kazan' },
      { name: 'Екатеринбург', queryName: 'Yekaterinburg' },
      { name: 'Сочи', queryName: 'Sochi' },
    ],
  },
  {
    code: 'RW',
    name: 'Руанда',
    queryName: 'Rwanda',
    cities: [{ name: 'Кигали', queryName: 'Kigali' }],
  },
  {
    code: 'RO',
    name: 'Румыния',
    queryName: 'Romania',
    cities: [
      { name: 'Бухарест', queryName: 'Bucharest' },
      { name: 'Клуж-Напока', queryName: 'Cluj-Napoca' },
      { name: 'Брашов', queryName: 'Brasov' },
      { name: 'Тимишоара', queryName: 'Timisoara' },
    ],
  },
  {
    code: 'SV',
    name: 'Сальвадор',
    queryName: 'El Salvador',
    cities: [{ name: 'Сан-Сальвадор', queryName: 'San Salvador' }],
  },
  {
    code: 'WS',
    name: 'Самоа',
    queryName: 'Samoa',
    cities: [{ name: 'Апиа', queryName: 'Apia' }],
  },
  {
    code: 'SM',
    name: 'Сан-Марино',
    queryName: 'San Marino',
    cities: [{ name: 'Сан-Марино', queryName: 'San Marino' }],
  },
  {
    code: 'ST',
    name: 'Сан-Томе и Принсипи',
    queryName: 'Sao Tome and Principe',
    cities: [{ name: 'Сан-Томе', queryName: 'Sao Tome' }],
  },
  {
    code: 'SA',
    name: 'Саудовская Аравия',
    queryName: 'Saudi Arabia',
    cities: [
      { name: 'Эр-Рияд', queryName: 'Riyadh' },
      { name: 'Джидда', queryName: 'Jeddah' },
      { name: 'Аль-Ула', queryName: 'AlUla' },
    ],
  },
  {
    code: 'KP',
    name: 'Северная Корея',
    queryName: 'North Korea',
    aliases: ['КНДР'],
    cities: [{ name: 'Пхеньян', queryName: 'Pyongyang' }],
  },
  {
    code: 'MK',
    name: 'Северная Македония',
    queryName: 'North Macedonia',
    cities: [
      { name: 'Скопье', queryName: 'Skopje' },
      { name: 'Охрид', queryName: 'Ohrid' },
    ],
  },
  {
    code: 'SC',
    name: 'Сейшельские Острова',
    queryName: 'Seychelles',
    aliases: ['Сейшелы'],
    cities: [{ name: 'Виктория', queryName: 'Victoria' }],
  },
  {
    code: 'SN',
    name: 'Сенегал',
    queryName: 'Senegal',
    cities: [{ name: 'Дакар', queryName: 'Dakar' }],
  },
  {
    code: 'VC',
    name: 'Сент-Винсент и Гренадины',
    queryName: 'Saint Vincent and the Grenadines',
    cities: [{ name: 'Кингстаун', queryName: 'Kingstown' }],
  },
  {
    code: 'KN',
    name: 'Сент-Китс и Невис',
    queryName: 'Saint Kitts and Nevis',
    cities: [{ name: 'Бастер', queryName: 'Basseterre' }],
  },
  {
    code: 'LC',
    name: 'Сент-Люсия',
    queryName: 'Saint Lucia',
    cities: [{ name: 'Кастри', queryName: 'Castries' }],
  },
  {
    code: 'RS',
    name: 'Сербия',
    queryName: 'Serbia',
    cities: [
      { name: 'Белград', queryName: 'Belgrade' },
      { name: 'Нови-Сад', queryName: 'Novi Sad' },
      { name: 'Ниш', queryName: 'Nis' },
    ],
  },
  {
    code: 'SG',
    name: 'Сингапур',
    queryName: 'Singapore',
    cities: [{ name: 'Сингапур', queryName: 'Singapore' }],
  },
  {
    code: 'SY',
    name: 'Сирия',
    queryName: 'Syria',
    cities: [
      { name: 'Дамаск', queryName: 'Damascus' },
      { name: 'Алеппо', queryName: 'Aleppo' },
    ],
  },
  {
    code: 'SK',
    name: 'Словакия',
    queryName: 'Slovakia',
    cities: [
      { name: 'Братислава', queryName: 'Bratislava' },
      { name: 'Кошице', queryName: 'Kosice' },
    ],
  },
  {
    code: 'SI',
    name: 'Словения',
    queryName: 'Slovenia',
    cities: [
      { name: 'Любляна', queryName: 'Ljubljana' },
      { name: 'Блед', queryName: 'Bled' },
      { name: 'Марибор', queryName: 'Maribor' },
      { name: 'Пиран', queryName: 'Piran' },
    ],
  },
  {
    code: 'SB',
    name: 'Соломоновы Острова',
    queryName: 'Solomon Islands',
    cities: [{ name: 'Хониара', queryName: 'Honiara' }],
  },
  {
    code: 'SO',
    name: 'Сомали',
    queryName: 'Somalia',
    cities: [{ name: 'Могадишо', queryName: 'Mogadishu' }],
  },
  {
    code: 'SD',
    name: 'Судан',
    queryName: 'Sudan',
    cities: [{ name: 'Хартум', queryName: 'Khartoum' }],
  },
  {
    code: 'SR',
    name: 'Суринам',
    queryName: 'Suriname',
    cities: [{ name: 'Парамарибо', queryName: 'Paramaribo' }],
  },
  {
    code: 'US',
    name: 'США',
    queryName: 'United States',
    aliases: ['Соединённые Штаты', 'Соединенные Штаты', 'Америка', 'USA'],
    cities: [
      { name: 'Нью-Йорк', queryName: 'New York' },
      { name: 'Сан-Франциско', queryName: 'San Francisco' },
      { name: 'Лос-Анджелес', queryName: 'Los Angeles' },
      { name: 'Чикаго', queryName: 'Chicago' },
      { name: 'Майами', queryName: 'Miami' },
      { name: 'Сиэтл', queryName: 'Seattle' },
    ],
  },
  {
    code: 'SL',
    name: 'Сьерра-Леоне',
    queryName: 'Sierra Leone',
    cities: [{ name: 'Фритаун', queryName: 'Freetown' }],
  },
  {
    code: 'TJ',
    name: 'Таджикистан',
    queryName: 'Tajikistan',
    cities: [
      { name: 'Душанбе', queryName: 'Dushanbe' },
      { name: 'Худжанд', queryName: 'Khujand' },
    ],
  },
  {
    code: 'TH',
    name: 'Таиланд',
    queryName: 'Thailand',
    cities: [
      { name: 'Бангкок', queryName: 'Bangkok' },
      { name: 'Чиангмай', queryName: 'Chiang Mai' },
      { name: 'Пхукет', queryName: 'Phuket' },
      { name: 'Самуи', queryName: 'Koh Samui' },
    ],
  },
  {
    code: 'TW',
    name: 'Тайвань',
    queryName: 'Taiwan',
    cities: [
      { name: 'Тайбэй', queryName: 'Taipei' },
      { name: 'Гаосюн', queryName: 'Kaohsiung' },
      { name: 'Тайнань', queryName: 'Tainan' },
      { name: 'Тайчжун', queryName: 'Taichung' },
    ],
  },
  {
    code: 'TZ',
    name: 'Танзания',
    queryName: 'Tanzania',
    cities: [
      { name: 'Дар-эс-Салам', queryName: 'Dar es Salaam' },
      { name: 'Занзибар', queryName: 'Zanzibar City' },
      { name: 'Аруша', queryName: 'Arusha' },
    ],
  },
  {
    code: 'TG',
    name: 'Того',
    queryName: 'Togo',
    cities: [{ name: 'Ломе', queryName: 'Lome' }],
  },
  {
    code: 'TO',
    name: 'Тонга',
    queryName: 'Tonga',
    cities: [{ name: 'Нукуалофа', queryName: 'Nukualofa' }],
  },
  {
    code: 'TT',
    name: 'Тринидад и Тобаго',
    queryName: 'Trinidad and Tobago',
    cities: [{ name: 'Порт-оф-Спейн', queryName: 'Port of Spain' }],
  },
  {
    code: 'TV',
    name: 'Тувалу',
    queryName: 'Tuvalu',
    cities: [{ name: 'Фунафути', queryName: 'Funafuti' }],
  },
  {
    code: 'TN',
    name: 'Тунис',
    queryName: 'Tunisia',
    cities: [
      { name: 'Тунис', queryName: 'Tunis' },
      { name: 'Сусс', queryName: 'Sousse' },
      { name: 'Хаммамет', queryName: 'Hammamet' },
    ],
  },
  {
    code: 'TM',
    name: 'Туркменистан',
    queryName: 'Turkmenistan',
    cities: [{ name: 'Ашхабад', queryName: 'Ashgabat' }],
  },
  {
    code: 'TR',
    name: 'Турция',
    queryName: 'Turkey',
    aliases: ['Türkiye'],
    cities: [
      { name: 'Стамбул', queryName: 'Istanbul' },
      { name: 'Анталья', queryName: 'Antalya' },
      { name: 'Измир', queryName: 'Izmir' },
      { name: 'Бодрум', queryName: 'Bodrum' },
      { name: 'Анкара', queryName: 'Ankara' },
      { name: 'Каш', queryName: 'Kas' },
    ],
  },
  {
    code: 'UG',
    name: 'Уганда',
    queryName: 'Uganda',
    cities: [{ name: 'Кампала', queryName: 'Kampala' }],
  },
  {
    code: 'UZ',
    name: 'Узбекистан',
    queryName: 'Uzbekistan',
    cities: [
      { name: 'Ташкент', queryName: 'Tashkent' },
      { name: 'Самарканд', queryName: 'Samarkand' },
      { name: 'Бухара', queryName: 'Bukhara' },
      { name: 'Хива', queryName: 'Khiva' },
    ],
  },
  {
    code: 'UA',
    name: 'Украина',
    queryName: 'Ukraine',
    cities: [
      { name: 'Киев', queryName: 'Kyiv' },
      { name: 'Львов', queryName: 'Lviv' },
      { name: 'Одесса', queryName: 'Odesa' },
      { name: 'Днепр', queryName: 'Dnipro' },
      { name: 'Харьков', queryName: 'Kharkiv' },
    ],
  },
  {
    code: 'UY',
    name: 'Уругвай',
    queryName: 'Uruguay',
    cities: [
      { name: 'Монтевидео', queryName: 'Montevideo' },
      { name: 'Пунта-дель-Эсте', queryName: 'Punta del Este' },
    ],
  },
  {
    code: 'FJ',
    name: 'Фиджи',
    queryName: 'Fiji',
    cities: [
      { name: 'Сува', queryName: 'Suva' },
      { name: 'Нади', queryName: 'Nadi' },
    ],
  },
  {
    code: 'PH',
    name: 'Филиппины',
    queryName: 'Philippines',
    cities: [
      { name: 'Манила', queryName: 'Manila' },
      { name: 'Себу', queryName: 'Cebu City' },
      { name: 'Давао', queryName: 'Davao City' },
    ],
  },
  {
    code: 'FI',
    name: 'Финляндия',
    queryName: 'Finland',
    cities: [
      { name: 'Хельсинки', queryName: 'Helsinki' },
      { name: 'Тампере', queryName: 'Tampere' },
      { name: 'Турку', queryName: 'Turku' },
      { name: 'Рованиеми', queryName: 'Rovaniemi' },
    ],
  },
  {
    code: 'FR',
    name: 'Франция',
    queryName: 'France',
    cities: [
      { name: 'Париж', queryName: 'Paris' },
      { name: 'Лион', queryName: 'Lyon' },
      { name: 'Ницца', queryName: 'Nice' },
      { name: 'Бордо', queryName: 'Bordeaux' },
      { name: 'Марсель', queryName: 'Marseille' },
      { name: 'Страсбург', queryName: 'Strasbourg' },
    ],
  },
  {
    code: 'HR',
    name: 'Хорватия',
    queryName: 'Croatia',
    cities: [
      { name: 'Загреб', queryName: 'Zagreb' },
      { name: 'Сплит', queryName: 'Split' },
      { name: 'Дубровник', queryName: 'Dubrovnik' },
      { name: 'Задар', queryName: 'Zadar' },
      { name: 'Ровинь', queryName: 'Rovinj' },
    ],
  },
  {
    code: 'CF',
    name: 'Центральноафриканская Республика',
    queryName: 'Central African Republic',
    aliases: ['ЦАР'],
    cities: [{ name: 'Банги', queryName: 'Bangui' }],
  },
  {
    code: 'TD',
    name: 'Чад',
    queryName: 'Chad',
    cities: [{ name: 'Нджамена', queryName: 'NDjamena' }],
  },
  {
    code: 'ME',
    name: 'Черногория',
    queryName: 'Montenegro',
    cities: [
      { name: 'Подгорица', queryName: 'Podgorica' },
      { name: 'Будва', queryName: 'Budva' },
      { name: 'Котор', queryName: 'Kotor' },
      { name: 'Тиват', queryName: 'Tivat' },
    ],
  },
  {
    code: 'CZ',
    name: 'Чехия',
    queryName: 'Czechia',
    aliases: ['Чешская Республика', 'Czech Republic'],
    cities: [
      { name: 'Прага', queryName: 'Prague' },
      { name: 'Брно', queryName: 'Brno' },
      { name: 'Карловы Вары', queryName: 'Karlovy Vary' },
    ],
  },
  {
    code: 'CL',
    name: 'Чили',
    queryName: 'Chile',
    cities: [
      { name: 'Сантьяго', queryName: 'Santiago' },
      { name: 'Вальпараисо', queryName: 'Valparaiso' },
    ],
  },
  {
    code: 'CH',
    name: 'Швейцария',
    queryName: 'Switzerland',
    cities: [
      { name: 'Цюрих', queryName: 'Zurich' },
      { name: 'Женева', queryName: 'Geneva' },
      { name: 'Базель', queryName: 'Basel' },
      { name: 'Берн', queryName: 'Bern' },
      { name: 'Лозанна', queryName: 'Lausanne' },
    ],
  },
  {
    code: 'SE',
    name: 'Швеция',
    queryName: 'Sweden',
    cities: [
      { name: 'Стокгольм', queryName: 'Stockholm' },
      { name: 'Гётеборг', queryName: 'Gothenburg' },
      { name: 'Мальмё', queryName: 'Malmo' },
    ],
  },
  {
    code: 'LK',
    name: 'Шри-Ланка',
    queryName: 'Sri Lanka',
    cities: [
      { name: 'Коломбо', queryName: 'Colombo' },
      { name: 'Галле', queryName: 'Galle' },
      { name: 'Канди', queryName: 'Kandy' },
      { name: 'Велигама', queryName: 'Weligama' },
    ],
  },
  {
    code: 'EC',
    name: 'Эквадор',
    queryName: 'Ecuador',
    cities: [
      { name: 'Кито', queryName: 'Quito' },
      { name: 'Гуаякиль', queryName: 'Guayaquil' },
      { name: 'Куэнка', queryName: 'Cuenca' },
    ],
  },
  {
    code: 'GQ',
    name: 'Экваториальная Гвинея',
    queryName: 'Equatorial Guinea',
    cities: [{ name: 'Малабо', queryName: 'Malabo' }],
  },
  {
    code: 'ER',
    name: 'Эритрея',
    queryName: 'Eritrea',
    cities: [{ name: 'Асмэра', queryName: 'Asmara' }],
  },
  {
    code: 'SZ',
    name: 'Эсватини',
    queryName: 'Eswatini',
    cities: [{ name: 'Мбабане', queryName: 'Mbabane' }],
  },
  {
    code: 'EE',
    name: 'Эстония',
    queryName: 'Estonia',
    cities: [
      { name: 'Таллин', queryName: 'Tallinn' },
      { name: 'Тарту', queryName: 'Tartu' },
      { name: 'Пярну', queryName: 'Parnu' },
    ],
  },
  {
    code: 'ET',
    name: 'Эфиопия',
    queryName: 'Ethiopia',
    cities: [{ name: 'Аддис-Абеба', queryName: 'Addis Ababa' }],
  },
  {
    code: 'ZA',
    name: 'ЮАР',
    queryName: 'South Africa',
    aliases: ['Южно-Африканская Республика', 'Южная Африка'],
    cities: [
      { name: 'Кейптаун', queryName: 'Cape Town' },
      { name: 'Йоханнесбург', queryName: 'Johannesburg' },
      { name: 'Дурбан', queryName: 'Durban' },
      { name: 'Претория', queryName: 'Pretoria' },
    ],
  },
  {
    code: 'KR',
    name: 'Южная Корея',
    queryName: 'South Korea',
    aliases: ['Республика Корея', 'Корея'],
    cities: [
      { name: 'Сеул', queryName: 'Seoul' },
      { name: 'Пусан', queryName: 'Busan' },
      { name: 'Инчхон', queryName: 'Incheon' },
      { name: 'Чеджу', queryName: 'Jeju City' },
    ],
  },
  {
    code: 'SS',
    name: 'Южный Судан',
    queryName: 'South Sudan',
    cities: [{ name: 'Джуба', queryName: 'Juba' }],
  },
  {
    code: 'JM',
    name: 'Ямайка',
    queryName: 'Jamaica',
    cities: [
      { name: 'Кингстон', queryName: 'Kingston' },
      { name: 'Монтего-Бей', queryName: 'Montego Bay' },
    ],
  },
  {
    code: 'JP',
    name: 'Япония',
    queryName: 'Japan',
    cities: [
      { name: 'Токио', queryName: 'Tokyo' },
      { name: 'Киото', queryName: 'Kyoto' },
      { name: 'Осака', queryName: 'Osaka' },
      { name: 'Фукуока', queryName: 'Fukuoka' },
      { name: 'Саппоро', queryName: 'Sapporo' },
    ],
  },
];

const ruCollator = new Intl.Collator('ru', { sensitivity: 'base' });

export const COUNTRIES_CATALOG = RAW_COUNTRIES_CATALOG.map((country) => ({
  ...country,
  queryName: country.queryName.trim(),
})).sort((a, b) => ruCollator.compare(a.name, b.name));

export const QUICK_CITY_PICKS = [
  { country: 'Литва', queryCountry: 'Lithuania', city: 'Вильнюс', queryCity: 'Vilnius' },
  { country: 'Португалия', queryCountry: 'Portugal', city: 'Лиссабон', queryCity: 'Lisbon' },
  { country: 'Испания', queryCountry: 'Spain', city: 'Барселона', queryCity: 'Barcelona' },
  { country: 'Япония', queryCountry: 'Japan', city: 'Токио', queryCity: 'Tokyo' },
  { country: 'Франция', queryCountry: 'France', city: 'Париж', queryCity: 'Paris' },
  { country: 'Грузия', queryCountry: 'Georgia', city: 'Тбилиси', queryCity: 'Tbilisi' },
  { country: 'Великобритания', queryCountry: 'United Kingdom', city: 'Лондон', queryCity: 'London' },
];

export function matchCatalogCountry(countryInput) {
  const cTrim = String(countryInput || '').trim().toLowerCase();
  if (!cTrim) return null;

  return (
    COUNTRIES_CATALOG.find(
      (c) =>
        c.name.toLowerCase() === cTrim ||
        c.queryName.toLowerCase() === cTrim ||
        (Array.isArray(c.aliases) &&
          c.aliases.some((alias) => alias.toLowerCase() === cTrim)),
    ) || null
  );
}

export function resolveCountryAndCityMeta(countryInput, cityInput) {
  const cTrim = String(countryInput || '').trim();
  const cityTrim = String(cityInput || '').trim();

  const foundCountry = matchCatalogCountry(cTrim);

  const foundCity = foundCountry?.cities.find(
    (ct) =>
      ct.name.toLowerCase() === cityTrim.toLowerCase() ||
      ct.queryName.toLowerCase() === cityTrim.toLowerCase(),
  );

  return {
    country: foundCountry ? foundCountry.name : cTrim,
    queryCountry: foundCountry ? foundCountry.queryName : cTrim,
    city: foundCity ? foundCity.name : cityTrim,
    queryCity: foundCity ? foundCity.queryName : cityTrim,
  };
}

/**
 * Explicit opt-in preview deck ONLY when user clicks "Preview demo deck"
 * while waiting for Google Cloud Console API activation to propagate.
 */
export function buildDemoPlacesForCity(cityMeta) {
  const { city, queryCity, queryCountry } = cityMeta;
  const slug = queryCity.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const buildDailyPeriods = (openHour, openMinute, closeHour, closeMinute) =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      open: { day, hour: openHour, minute: openMinute },
      close: {
        day: closeHour < openHour ? (day + 1) % 7 : day,
        hour: closeHour,
        minute: closeMinute,
      },
    }));

  const rawSpots = [
    {
      suffix: 'atelier-bistro',
      name: `Atelier Terroir ${queryCity}`,
      category: 'restaurant',
      categoryLabel: 'Авторский ресторан',
      rating: 4.8,
      userRatingCount: 642,
      priceSymbol: '$$$',
      priceLabel: 'Высокий чек',
      address: `Центральный квартал, ${city}`,
      summary: 'Сезонная локальная кухня на открытом огне и камерная винная карта.',
      openNow: true,
      distanceKm: 0.5,
      periods: buildDailyPeriods(12, 0, 23, 30),
      seed: `${slug}-restaurant-fire-dining`,
      reservable: true,
    },
    {
      suffix: 'velvet-Highball',
      name: `Nocturne Highball Club`,
      category: 'bar',
      categoryLabel: 'Коктейль-бар',
      rating: 4.9,
      userRatingCount: 418,
      priceSymbol: '$$',
      priceLabel: 'Средний чек',
      address: `Старый город, ${city}`,
      summary: 'Авторские миксы, виниловый звук и приглушённый вечерний свет.',
      openNow: true,
      distanceKm: 0.9,
      periods: buildDailyPeriods(18, 0, 2, 30),
      seed: `${slug}-cocktail-speakeasy-bar`,
    },
    {
      suffix: 'roastery-lab',
      name: `Kōhī & Crumb Roasters`,
      category: 'cafe',
      categoryLabel: 'Спешелти-кофейня',
      rating: 4.7,
      userRatingCount: 890,
      priceSymbol: '$',
      priceLabel: 'Демократично',
      address: `Арт-кластер, ${city}`,
      summary: 'Собственная обжарка микролотов, фильтр-кофе и утренняя слоёная выпечка.',
      openNow: true,
      distanceKm: 1.6,
      periods: buildDailyPeriods(7, 30, 18, 0),
      seed: `${slug}-specialty-coffee-cafe`,
    },
    {
      suffix: 'mar-osteria',
      name: `Casa Brasa & Mar`,
      category: 'restaurant',
      categoryLabel: 'Морское бистро',
      rating: 4.6,
      userRatingCount: 512,
      priceSymbol: '$$',
      priceLabel: 'Средний чек',
      address: `Набережная, ${city}`,
      summary: 'Свежие морепродукты, домашняя паста и вид на вечерние огни города.',
      openNow: true,
      distanceKm: 2.8,
      periods: buildDailyPeriods(12, 0, 22, 30),
      seed: `${slug}-seafood-bistro-dinner`,
      reservable: true,
    },
    {
      suffix: 'natural-wine',
      name: `Flora Natural Wine Bar`,
      category: 'bar',
      categoryLabel: 'Винный бар',
      rating: 4.8,
      userRatingCount: 274,
      priceSymbol: '$$',
      priceLabel: 'Средний чек',
      address: `Исторический пассаж, ${city}`,
      summary: 'Биодинамические вина небольших хозяйств и ремесленные закуски.',
      openNow: false,
      distanceKm: 1.2,
      periods: buildDailyPeriods(17, 0, 1, 0),
      seed: `${slug}-natural-wine-bar-glass`,
    },
    {
      suffix: 'matcha-patisserie',
      name: `Solstice Bakehouse`,
      category: 'cafe',
      categoryLabel: 'Кафе-пекарня',
      rating: 4.9,
      userRatingCount: 735,
      priceSymbol: '$$',
      priceLabel: 'Средний чек',
      address: `Бульварный район, ${city}`,
      summary: 'Ремесленный тартин, церемониальная матча и светлая веранда.',
      openNow: true,
      distanceKm: 4.4,
      periods: buildDailyPeriods(8, 0, 20, 0),
      seed: `${slug}-artisan-bakery-brunch`,
    },
  ];

  const DEMO_PHOTO_POOLS = {
    restaurant: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=720&q=80',
    ],
    bar: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=720&q=80',
    ],
    cafe: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=720&q=80',
    ],
  };

  return rawSpots.map((spot, spotIdx) => {
    const placeId = `demo_${slug}_${spot.suffix}`;
    const mapsQuery = encodeURIComponent(`${spot.category} in ${queryCity}, ${queryCountry}`);
    const pool = DEMO_PHOTO_POOLS[spot.category] || DEMO_PHOTO_POOLS.restaurant;
    // Vary photo count (3 to 4) realistically across demo venues
    const count = 3 + (spotIdx % 2);
    const photoUrls = pool.slice(0, count);
    return {
      placeId,
      isDemo: true,
      name: spot.name,
      category: spot.category,
      categoryLabel: spot.categoryLabel,
      photoUrl: photoUrls[0],
      photoUrls,
      photoAuthor: 'Demo Preview',
      rating: spot.rating,
      userRatingCount: spot.userRatingCount,
      priceSymbol: spot.priceSymbol,
      priceLabel: spot.priceLabel,
      priceTier: spot.priceSymbol.length,
      address: spot.address,
      fullAddress: `${spot.address}, ${queryCountry}`,
      summary: spot.summary,
      openNow: spot.openNow,
      distanceKm: spot.distanceKm,
      openingHours: {
        openNowSnapshot: spot.openNow,
        periods: spot.periods,
        weekdayDescriptions: [],
        utcOffsetMinutes: null,
      },
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      reservable: Boolean(spot.reservable),
      reservationUrl: spot.reservable
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' table reservation')}`
        : null,
    };
  });
}
