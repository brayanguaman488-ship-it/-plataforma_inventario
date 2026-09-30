# Data Part 1: Apple Products (iPhone 12 to 17, AirPods, Apple Watch, iPad, MacBook)
import json

DATA_PART_1 = [
    # Page 1
    {
        "sku": "AIRPODS-PRO3-NOISECANCEL",
        "name": "AIRPODS PRO 3 NOISE CANCELLING",
        "brand": "Apple",
        "model": "AirPods Pro 3",
        "category": "Audio & Wearables",
        "cost": 226.00,
        "price": 280.00,
        "stock": 5,
        "sales": [
            ("02/03/2026", "ANDRES SANANGO", "1455", 4.0, 904.00, 1060.00, 156.00),
            ("20/03/2026", "JORGE CARVAJAL", "1499", 1.0, 226.00, 280.00, 54.00)
        ]
    },
    {
        "sku": "APPLE-WATCH-S11-42MM",
        "name": "APPLE WATCH SERIES 11 42MM",
        "brand": "Apple",
        "model": "Watch Series 11 42mm",
        "category": "Audio & Wearables",
        "cost": 336.00,
        "price": 375.00,
        "stock": 3,
        "sales": [
            ("03/03/2026", "SEGUNDO ILBAY", "1463", 1.0, 336.00, 375.00, 39.00),
            ("04/03/2026", "SEGUNDO ILBAY", "1469", 7.0, 2352.00, 2555.00, 203.00)
        ]
    },
    {
        "sku": "APPLE-WATCH-S11-46MM",
        "name": "APPLE WATCH SERIES 11 46MM",
        "brand": "Apple",
        "model": "Watch Series 11 46mm",
        "category": "Audio & Wearables",
        "cost": 366.00,
        "price": 395.00,
        "stock": 2,
        "sales": [
            ("04/03/2026", "SEGUNDO ILBAY", "1469", 6.0, 2196.00, 2370.00, 174.00)
        ]
    },
    {
        "sku": "IPAD-11-A-16-128GB-WIFI",
        "name": "IPAD 11 A16-128GB WIFI",
        "brand": "Apple",
        "model": "iPad 11 A16 128GB",
        "category": "Tablets",
        "cost": 345.00,
        "price": 380.00,
        "stock": 4,
        "sales": [
            ("21/02/2026", "ANDRES SANANGO", "1415", 3.0, 1095.00, 1200.00, 105.00),
            ("23/02/2026", "XAVIER ARIAS", "1417", 1.0, 365.00, 400.00, 35.00),
            ("24/02/2026", "SEGUNDO ILBAY", "1425", 2.0, 730.00, 800.00, 70.00),
            ("25/02/2026", "SEGUNDO ILBAY", "1429", 2.0, 730.00, 800.00, 70.00),
            ("09/05/2026", "SILVIA GUZMAN", "1607", 2.0, 674.00, 740.00, 66.00),
            ("09/05/2026", "ANDRES SANANGO", "1613", 3.0, 1011.00, 1110.00, 99.00),
            ("12/05/2026", "SEGUNDO ILBAY", "1627", 1.0, 337.00, 370.00, 33.00),
            ("03/06/2026", "YAYMEL ZANS", "1863", 2.0, 690.00, 720.00, 30.00),
            ("03/06/2026", "MIGUEL RUEDA", "1871", 4.0, 1380.00, 1440.00, 60.00),
            ("04/06/2026", "MIGUEL RUEDA", "1893", 1.0, 345.00, 360.00, 15.00),
            ("09/06/2026", "JEAN DT", "1917", 3.0, 1035.00, 1080.00, 45.00)
        ]
    },
    {
        "sku": "IPAD-A-16-256-GB-WIFI",
        "name": "IPAD 11 A16 256GB WIFI",
        "brand": "Apple",
        "model": "iPad 11 A16 256GB",
        "category": "Tablets",
        "cost": 465.00,
        "price": 510.00,
        "stock": 3,
        "sales": [
            ("24/02/2026", "SEGUNDO ILBAY", "1425", 2.0, 930.00, 1040.00, 110.00),
            ("06/03/2026", "ADRIAN DIAZ", "1475", 2.0, 930.00, 1000.00, 70.00)
        ]
    },
    # Page 2
    {
        "sku": "IPHONE-12-128-GB-OPEN-BOX",
        "name": "IPHONE 12 128 GB OPEN BOX",
        "brand": "Apple",
        "model": "iPhone 12 128GB",
        "category": "Smartphones",
        "cost": 260.00,
        "price": 280.00,
        "stock": 2,
        "sales": [
            ("12/12/2025", "JENNY CARAPAZ", "1341", 3.0, 780.00, 840.00, 60.00)
        ]
    },
    {
        "sku": "IPHONE-13-128GB",
        "name": "IPHONE 13 128GB NUEVO",
        "brand": "Apple",
        "model": "iPhone 13 128GB",
        "category": "Smartphones",
        "cost": 480.00,
        "price": 525.00,
        "stock": 4,
        "sales": [
            ("21/01/2025", "ADRIAN DIAZ", "801", 4.0, 1989.00, 2180.00, 191.00),
            ("21/01/2025", "HECTOR ARCOS", "809", 2.0, 994.50, 1090.00, 95.50),
            ("22/01/2025", "MAURICIO TOVAR", "819", 1.0, 497.25, 530.00, 32.75),
            ("25/01/2025", "OMAR TINAJERO", "831", 1.0, 497.25, 530.00, 32.75),
            ("28/01/2025", "ADRIAN DIAZ", "837", 1.0, 497.25, 530.00, 32.75),
            ("28/01/2025", "MAURICIO ROMAN", "841", 1.0, 497.25, 530.00, 32.75),
            ("04/02/2025", "FAUSTO VALENCIA", "867", 1.0, 480.31, 530.00, 49.69),
            ("10/02/2025", "PTRICIA GUERRERO", "895", 3.0, 1440.93, 1545.00, 104.07),
            ("10/02/2025", "RICHARD JIMENEZ", "901", 6.0, 2881.86, 3090.00, 208.14),
            ("11/02/2025", "OSCAR SARABIA", "907", 3.0, 1440.93, 1545.00, 104.07),
            ("18/02/2025", "MAURICIO ROMAN", "935", 1.0, 480.31, 515.00, 34.69),
            ("18/02/2025", "ADRIAN DIAZ", "937", 1.0, 480.31, 515.00, 34.69),
            ("29/03/2025", "ADRIAN DIAZ", "1015", 1.0, 482.96, 525.00, 42.04),
            ("31/03/2025", "ISMAEL GODOY", "1027", 2.0, 965.92, 1050.00, 84.08),
            ("01/04/2025", "ANDRES SANANGO", "1033", 2.0, 965.92, 1050.00, 84.08),
            ("02/04/2025", "FAUSTO VALENCIA", "1039", 1.0, 482.96, 525.00, 42.04),
            ("14/04/2025", "ANDRES SANANGO", "1065", 2.0, 985.92, 1060.00, 74.08),
            ("16/04/2025", "ISMAEL GODOY", "1067", 4.0, 1971.84, 2120.00, 148.16),
            ("08/05/2025", "ERICK SALAS", "1097", 1.0, 320.25, 515.00, 194.75),
            ("15/05/2025", "MAURICIO ROMAN", "1111", 1.0, 320.25, 510.00, 189.75),
            ("24/05/2025", "ANDRES SANANGO", "1131", 3.0, 960.75, 1515.00, 554.25),
            ("27/05/2025", "ANDRES SANANGO", "1145", 1.0, 320.25, 505.00, 184.75),
            ("29/05/2025", "RODRIGO ALVAREZ", "1151", 1.0, 320.25, 505.00, 184.75),
            ("30/05/2025", "XAVIER ARIAS", "1155", 1.0, 320.25, 505.00, 184.75),
            ("30/05/2025", "WLADIMIR CALDERON", "1157", 2.0, 640.50, 1010.00, 369.50),
            ("07/07/2025", "ERICK SALAS", "1191", 1.0, 464.36, 510.00, 45.64),
            ("07/07/2025", "RODRIGO ALVAREZ", "1193", 1.0, 464.36, 510.00, 45.64),
            ("08/07/2025", "ISMAEL GODOY", "1195", 2.0, 928.72, 1010.00, 81.28),
            ("17/07/2025", "ADRIAN DIAZ", "1229", 1.0, 464.36, 505.00, 40.64)
        ]
    },
    {
        "sku": "IPHONE-14-128GB",
        "name": "IPHONE14 128GB NUEVO",
        "brand": "Apple",
        "model": "iPhone 14 128GB",
        "category": "Smartphones",
        "cost": 590.00,
        "price": 620.00,
        "stock": 3,
        "sales": [
            ("05/05/2025", "ANDRES SANANGO", "1091", 2.0, 1213.19, 1240.00, 26.81),
            ("07/05/2025", "PAMELA BORJA", "1093", 1.0, 606.60, 610.00, 3.40),
            ("09/05/2025", "ADRIAN DIAZ", "1101", 2.0, 1213.19, 1230.00, 16.81),
            ("30/06/2025", "SEGUNDO ILBAY", "1181", 1.0, 605.28, 600.00, -5.28),
            ("09/07/2025", "ADRIAN DIAZ", "1203", 2.0, 1143.37, 1180.00, 36.63),
            ("17/07/2025", "ADRIAN DIAZ", "1229", 2.0, 1143.37, 1170.00, 26.63),
            ("28/03/2026", "JORGE OSORIO", "1521", 1.0, 571.68, 385.00, -186.68),
            ("17/06/2026", "SHEYLA OCHOA", "1939", 1.0, 394.23, 395.00, 0.77),
            ("26/06/2026", "ANDRES SANANGO", "2021", 2.0, 788.47, 740.00, -48.47),
            ("30/06/2026", "SHEYLA OCHOA", "2031", 3.0, 1182.70, 1110.00, -72.70),
            ("30/06/2026", "WLADIMIR CALDERON", "2037", 1.0, 394.23, 370.00, -24.23),
            ("30/06/2026", "JEAN DT", "2041", 3.0, 1182.70, 1095.00, -87.70)
        ]
    }
]
