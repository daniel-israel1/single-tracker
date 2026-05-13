// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bike, Mountain, MapPin, ExternalLink, UserPlus, 
  Trophy, Route, Activity, Plus, Minus, Info, 
  CheckCircle2, Battery, Save, Loader2, Pencil, FilterX,
  Map as LucideMap, LayoutGrid
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, writeBatch } from 'firebase/firestore';

// הגדרות Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmK7bR61OzD4sBCe9LdPA1Wzod8SUKs5w",
  authDomain: "single-tracker.firebaseapp.com",
  databaseURL: "https://single-tracker-default-rtdb.firebaseio.com",
  projectId: "single-tracker",
  storageBucket: "single-tracker.firebasestorage.app",
  messagingSenderId: "384655609113",
  appId: "1:384655609113:web:c3ae09f340099c08764988",
  measurementId: "G-S6G86EE31Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Data - Updated with 46 KKL trails and Coordinates
const TRAILS = [
  { id: 't1', name: 'סינגל עירון (ואדי ערה)', region: 'שרון ומרכז', difficulty: 'בינוני', lengthKm: 32, elevationM: 420, popularity: '⭐⭐⭐⭐⭐ מסלול מדהים', kklLink: 'https://www.kkl.org.il/bike/trips/hiron_070825/', reviewLink: 'https://eyarok.org.il/trip/239', coords: [32.484, 35.034] },
  { id: 't2', name: 'השופט - טבעת צהובה', region: 'כרמל ועמקים', difficulty: 'קל', lengthKm: 13, elevationM: 300, popularity: '⭐⭐⭐⭐ מעולה למתחילים, צל', kklLink: 'https://www.kkl.org.il/bike/trips/', reviewLink: 'https://eyarok.org.il/trip/202', coords: [32.61, 35.09] },
  { id: 't3', name: 'השופט - טבעת כחולה', region: 'כרמל ועמקים', difficulty: 'בינוני', lengthKm: 17, elevationM: 350, popularity: '⭐⭐⭐⭐ דורש כושר', kklLink: 'https://www.kkl.org.il/bike/trips/', reviewLink: 'https://eyarok.org.il/trip/202', coords: [32.615, 35.09] },
  { id: 't4', name: 'רמת הנדיב (משולב)', region: 'רמת הנדיב', difficulty: 'קל-בינוני', lengthKm: 15, elevationM: 250, popularity: '⭐⭐⭐⭐ נופים לים', kklLink: 'https://www.ramat-hanadiv.org.il/פארק-הטבע/שבילי-האופניים/', reviewLink: 'https://eyarok.org.il/trip/198', coords: [32.55, 34.94] },
  { id: 't5', name: 'בן שמן - הרצל (כחול)', region: 'ירושלים ויהודה', difficulty: 'קל', lengthKm: 10.5, elevationM: 180, popularity: '⭐⭐⭐⭐ הקלאסיקה', kklLink: 'https://kkl-jnf.org/tourism-and-recreation/recommended_trips_and_tracks/ben-shemen-routes/', reviewLink: 'https://eyarok.org.il/trip/221', coords: [31.95, 34.95] },
  { id: 't6', name: 'בן שמן - ענבה (אדום)', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 24, elevationM: 450, popularity: '⭐⭐⭐⭐⭐ טכני וקשוח', kklLink: 'https://kkl-jnf.org/tourism-and-recreation/recommended_trips_and_tracks/ben-shemen-routes/', reviewLink: 'https://eyarok.org.il/trip/221', coords: [31.94, 34.96] },
  { id: 't7', name: 'סינגל בארי (האדום)', region: 'דרום', difficulty: 'קל', lengthKm: 18, elevationM: 200, popularity: '⭐⭐⭐⭐ דרום אדום', kklLink: 'https://www.kkl.org.il/bike/trips/2000/', reviewLink: 'https://eyarok.org.il/trip/255', coords: [31.42, 34.49] },
  { id: 't8', name: 'סינגל גברעם', region: 'דרום', difficulty: 'קל', lengthKm: 20, elevationM: 160, popularity: '⭐⭐⭐ גבעות כורכר', kklLink: 'https://www.kkl.org.il/bike/trips/1997/', reviewLink: 'https://eyarok.org.il/trip/260', coords: [31.58, 34.61] },
  { id: 't9', name: 'סינגל שמשית', region: 'צפון', difficulty: 'קל', lengthKm: 12, elevationM: 150, popularity: 'קצר וקולע, מתאים גם לילדים.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/205', coords: [32.74, 35.25] },
  { id: 't10', name: 'סינגל סוללים', region: 'צפון', difficulty: 'קל', lengthKm: 14, elevationM: 200, popularity: 'מצוין לשילוב עם שמשית.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/206', coords: [32.75, 35.24] },
  { id: 't11', name: 'סינגל אלון הגליל', region: 'צפון', difficulty: 'בינוני', lengthKm: 22, elevationM: 400, popularity: 'עליות משמעותיות, נוף גלילי.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/207', coords: [32.75, 35.22] },
  { id: 't12', name: 'חוף הכרמל (האדום)', region: 'כרמל ועמקים', difficulty: 'קשה', lengthKm: 18, elevationM: 420, popularity: '⭐⭐⭐⭐ חורש טבעי', kklLink: 'https://www.kkl.org.il/bike/trips/2907/', reviewLink: 'https://eyarok.org.il/trip/210', coords: [32.64, 34.97] },
  { id: 't13', name: 'סינגל ביריה (לימונים)', region: 'צפון', difficulty: 'בינוני', lengthKm: 20, elevationM: 500, popularity: '⭐⭐⭐⭐ שלוש לולאות מעל צפת', kklLink: 'https://www.kkl.org.il/bike/trips/2994/', reviewLink: 'https://eyarok.org.il/trip/190', coords: [32.99, 35.49] },
  { id: 't14', name: 'סינגל גורל', region: 'דרום', difficulty: 'בינוני', lengthKm: 30, elevationM: 400, popularity: 'נוף מדברי עוצר נשימה.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/270', coords: [31.33, 34.82] },
  { id: 't15', name: 'סינגל רוחמה', region: 'דרום', difficulty: 'קל', lengthKm: 18, elevationM: 200, popularity: 'בתרונות רוחמה היפים.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/265', coords: [31.49, 34.69] },
  { id: 't16', name: 'משמר העמק', region: 'כרמל ועמקים', difficulty: 'קשה', lengthKm: 32, elevationM: 800, popularity: 'מבחן כושר אמיתי ביער קסום.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/209', coords: [32.61, 35.13] },
  { id: 't17', name: 'סינגל גלבוע', region: 'צפון', difficulty: 'קשה', lengthKm: 32, elevationM: 900, popularity: '⭐⭐⭐⭐ תופר את רכס הגלבוע', kklLink: 'https://www.kkl.org.il/bike/trips/2188/', reviewLink: 'https://eyarok.org.il/trip/204', coords: [32.51, 35.40] },
  { id: 't18', name: 'סינגל יתיר', region: 'דרום', difficulty: 'קשה', lengthKm: 32, elevationM: 650, popularity: 'היער הנטוע הגדול בישראל.', kklLink: 'https://www.kkl.org.il/bike/', reviewLink: 'https://eyarok.org.il/trip/280', coords: [31.35, 35.05] },
  { id: 't19', name: 'סינגל חניתה', region: 'צפון', difficulty: 'בינוני', lengthKm: 22, elevationM: 550, popularity: '⭐⭐⭐⭐ ארוך וזורם', kklLink: 'https://www.kkl.org.il/bike/trips/2755/', reviewLink: '', coords: [33.08, 35.17] },
  { id: 't20', name: 'סינגל נפתלי', region: 'צפון', difficulty: 'קשה', lengthKm: 28, elevationM: 800, popularity: '⭐⭐⭐⭐⭐ תצפית מדהימה', kklLink: 'https://www.kkl.org.il/bike/trips/2339/', reviewLink: '', coords: [33.15, 35.53] },
  { id: 't21', name: 'יערות ציפורי', region: 'צפון', difficulty: 'בינוני', lengthKm: 30, elevationM: 600, popularity: '⭐⭐⭐⭐ כולל פאמפטרק', kklLink: 'https://www.kkl.org.il/bike/trips/3/', reviewLink: '', coords: [32.75, 35.26] },
  { id: 't22', name: 'סינגל חנתון', region: 'צפון', difficulty: 'קל', lengthKm: 15, elevationM: 300, popularity: '⭐⭐⭐⭐ מומלץ למתחילים', kklLink: 'https://www.kkl.org.il/bike/trips/hamovil/', reviewLink: '', coords: [32.78, 35.23] },
  { id: 't23', name: 'כפר החורש–יפיע', region: 'צפון', difficulty: 'בינוני', lengthKm: 18, elevationM: 400, popularity: '⭐⭐⭐ נוף גלילי', kklLink: 'https://www.kkl.org.il/bike/trips/2177/', reviewLink: '', coords: [32.70, 35.26] },
  { id: 't24', name: 'אנדורו יער שגב', region: 'צפון', difficulty: 'מומחה', lengthKm: 12, elevationM: 450, popularity: '⭐⭐⭐⭐⭐ ירידה מהירה', kklLink: 'https://www.kkl.org.il/bike/trips/2122/', reviewLink: '', coords: [32.85, 35.24] },
  { id: 't25', name: 'חזון (גליל תחתון)', region: 'צפון', difficulty: 'בינוני', lengthKm: 30, elevationM: 700, popularity: '⭐⭐⭐⭐ דורש כושר', kklLink: 'https://bike.co.il/trip-edu-hazon-singel-kkl/', reviewLink: '', coords: [32.89, 35.41] },
  { id: 't26', name: 'סינגל מרום גולן', region: 'צפון', difficulty: 'בינוני', lengthKm: 10, elevationM: 250, popularity: '⭐⭐⭐ יער האלונים', kklLink: 'https://www.kkl.org.il/bike/trips/2620/', reviewLink: '', coords: [33.13, 35.77] },
  { id: 't27', name: 'סינגל משגב', region: 'כרמל ועמקים', difficulty: 'קשה', lengthKm: 25, elevationM: 700, popularity: '⭐⭐⭐⭐ נופים מרהיבים', kklLink: 'https://www.kkl.org.il/bike/trips/2122/', reviewLink: '', coords: [32.87, 35.25] },
  { id: 't28', name: 'שביל אלון הגליל (כינרת)', region: 'צפון', difficulty: 'בינוני', lengthKm: 15, elevationM: 300, popularity: '⭐⭐⭐⭐ מול הכנרת', kklLink: 'https://www.kkl.org.il/bike/trips/2006/', reviewLink: '', coords: [32.78, 35.53] },
  { id: 't29', name: 'סינגל יער שוויץ', region: 'צפון', difficulty: 'קל', lengthKm: 14, elevationM: 180, popularity: '⭐⭐⭐⭐ נוף כנרת', kklLink: 'https://www.kkl.org.il/bike/trips/2161/', reviewLink: '', coords: [32.76, 35.53] },
  { id: 't30', name: 'סינגל יער שוהם', region: 'שרון ומרכז', difficulty: 'קל', lengthKm: 15, elevationM: 200, popularity: '⭐⭐⭐ קרוב למרכז', kklLink: 'https://www.kkl.org.il/bike/trips/2126/', reviewLink: '', coords: [31.98, 34.95] },
  { id: 't31', name: 'שביל הרכסים (IMBA)', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 40, elevationM: 1100, popularity: '⭐⭐⭐⭐⭐ מסע מרתק', kklLink: 'https://www.kkl.org.il/bike/trips/2013/', reviewLink: '', coords: [31.75, 35.12] },
  { id: 't32', name: 'חדיד (ירוק) — בן שמן', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 11, elevationM: 280, popularity: '⭐⭐⭐⭐ הפתעות טכניות', kklLink: 'https://kkl-jnf.org/tourism-and-recreation/recommended_trips_and_tracks/ben-shemen-routes/', reviewLink: '', coords: [31.97, 34.96] },
  { id: 't33', name: 'סינגל עין ראפה', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 29, elevationM: 950, popularity: '⭐⭐⭐⭐⭐ פופולרי', kklLink: 'https://www.kkl.org.il/bike/trips/2082/', reviewLink: '', coords: [31.79, 35.10] },
  { id: 't34', name: 'פארק בריטניה', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 22, elevationM: 600, popularity: '⭐⭐⭐⭐⭐ נוף מרהיב', kklLink: 'https://www.kkl.org.il/bike/trips/1999/', reviewLink: '', coords: [31.68, 34.92] },
  { id: 't35', name: 'סינגל זכריה', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 14, elevationM: 350, popularity: '⭐⭐⭐ יער ישעי', kklLink: 'https://www.kkl.org.il/bike/trips/1968/', reviewLink: '', coords: [31.72, 34.93] },
  { id: 't36', name: 'סינגל חרובית', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 12, elevationM: 380, popularity: '⭐⭐⭐⭐ חגיגת אדרנלין', kklLink: 'https://www.kkl.org.il/bike/trips/1969/', reviewLink: '', coords: [31.73, 34.84] },
  { id: 't37', name: 'פארק קנדה אילון', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 20, elevationM: 450, popularity: '⭐⭐⭐⭐ נופים מרהיבים', kklLink: 'https://www.kkl.org.il/bike/trips/2005/', reviewLink: '', coords: [31.83, 34.99] },
  { id: 't38', name: 'שביל עדולם–צרפת', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 35, elevationM: 850, popularity: '⭐⭐⭐⭐ מאתגר פיזית', kklLink: 'https://www.kkl.org.il/bike/trips/2004/', reviewLink: '', coords: [31.64, 34.95] },
  { id: 't39', name: 'סינגל משואה', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 18, elevationM: 400, popularity: '⭐⭐⭐⭐ מסלול מחודש', kklLink: 'https://www.kkl.org.il/bike/trips/2928/', reviewLink: '', coords: [31.65, 34.91] },
  { id: 't40', name: 'שבילי יער הקדושים', region: 'ירושלים ויהודה', difficulty: 'בינוני', lengthKm: 20, elevationM: 450, popularity: '⭐⭐⭐⭐ פארק יפיפה', kklLink: 'https://www.kkl.org.il/bike/trips/2152/', reviewLink: '', coords: [31.78, 35.04] },
  { id: 't41', name: 'סינגל קנים', region: 'ירושלים ויהודה', difficulty: 'קשה', lengthKm: 18, elevationM: 600, popularity: '⭐⭐⭐ מאתגר פיזית וטכנית', kklLink: 'https://www.kkl.org.il/bike/trips/2003/', reviewLink: '', coords: [31.69, 34.92] },
  { id: 't42', name: 'עין קובי (פארק בגין)', region: 'ירושלים ויהודה', difficulty: 'קל', lengthKm: 8, elevationM: 150, popularity: '⭐⭐⭐ מעגלי חדש', kklLink: 'https://www.kkl.org.il/bike/trips/8793/', reviewLink: '', coords: [31.73, 35.11] },
  { id: 't43', name: 'סינגל בארי — הכחול', region: 'דרום', difficulty: 'בינוני', lengthKm: 25, elevationM: 320, popularity: '⭐⭐⭐ יערות ונחלים', kklLink: 'https://www.kkl.org.il/bike/trips/2002/', reviewLink: '', coords: [31.425, 34.49] },
  { id: 't44', name: 'סינגל אסף-כיסופים', region: 'דרום', difficulty: 'קל', lengthKm: 22, elevationM: 180, popularity: '⭐⭐⭐⭐ רכיבה זורמת', kklLink: 'https://www.kkl.org.il/bike/trips/3004/', reviewLink: '', coords: [31.37, 34.42] },
  { id: 't45', name: 'שרשרת (בתרונות גרר)', region: 'דרום', difficulty: 'קל', lengthKm: 31.5, elevationM: 350, popularity: '⭐⭐⭐⭐ שלוש לולאות', kklLink: 'https://www.kkl.org.il/bike/trips/2796/', reviewLink: '', coords: [31.37, 34.61] },
  { id: 't46', name: 'סינגלים פארק תמנע', region: 'דרום', difficulty: 'בינוני', lengthKm: 20, elevationM: 450, popularity: '⭐⭐⭐⭐ נוף מדברי', kklLink: 'https://www.kkl.org.il/bike/trips/2576/', reviewLink: '', coords: [29.77, 34.98] }
];

// Component to handle dynamic Map rendering securely
const MapView = ({ trails, getProgressForTrail, setViewMode, setSearchQuery }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        await new Promise(resolve => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!isMounted) return;

      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = window.L.map(mapRef.current).setView([31.7, 34.9], 8);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(mapInstance.current);
        markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);
      }

      if (mapInstance.current && markersLayer.current) {
        markersLayer.current.clearLayers();

        trails.forEach(trail => {
          if (!trail.coords) return;
          
          const userProg = getProgressForTrail(trail.id);
          const isDone = (userProg.ebikeCount + userProg.analogCount) > 0;
          
          const bgColor = isDone ? '#10b981' : '#f43f5e';
          const iconSvg = isDone 
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;
            
          const customIcon = window.L.divIcon({
            className: 'custom-leaflet-icon',
            html: `<div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${iconSvg}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
          });

          const marker = window.L.marker(trail.coords, { icon: customIcon });
          
          const popupContent = document.createElement('div');
          popupContent.className = 'text-right font-sans';
          popupContent.dir = 'rtl';
          popupContent.innerHTML = `
            <h3 class="font-bold text-base mb-1 flex items-center gap-1.5">
              ${isDone ? '<span style="color:#10b981">✓</span>' : ''} ${trail.name}
            </h3>
            <p class="text-xs text-slate-600 mb-2">${trail.region} | <span class="font-semibold">${trail.difficulty}</span></p>
            <p class="text-xs mb-3 font-medium">${trail.lengthKm} ק"מ | ${trail.elevationM} מ' טיפוס</p>
            <div class="flex gap-2 border-t pt-2 mt-2 border-slate-100">
              <button id="btn-${trail.id}" class="text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-md hover:bg-emerald-100 transition flex-1 text-center cursor-pointer">
                עדכן רכיבה במסלול
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          
          marker.on('popupopen', () => {
            const btn = document.getElementById(`btn-${trail.id}`);
            if (btn) {
              btn.onclick = () => {
                setViewMode('grid');
                setSearchQuery(trail.name);
              };
            }
          });

          markersLayer.current.addLayer(marker);
        });
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [trails, getProgressForTrail, setViewMode, setSearchQuery]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full rounded-xl z-0" style={{ zIndex: 0 }}></div>;
};

export default function KKLTrackerApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [customLinks, setCustomLinks] = useState({});
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // States for View Mode & Links
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [editingLinksId, setEditingLinksId] = useState(null);
  const [editKklLink, setEditKklLink] = useState('');
  const [editReviewLink, setEditReviewLink] = useState('');
  
  // Filters
  const [filterRegion, setFilterRegion] = useState('הכל');
  const [filterDifficulty, setFilterDifficulty] = useState('הכל');
  const [filterLength, setFilterLength] = useState('הכל'); 
  const [filterStatus, setFilterStatus] = useState('הכל'); 
  const [searchQuery, setSearchQuery] = useState('');

  const usersRef = collection(db, 'kkl_users');
  const progressRef = collection(db, 'kkl_progress');
  const linksRef = collection(db, 'kkl_links');

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
        setIsLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      if (!user) setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    let isFirstLoad = true;
    setIsFetching(true);

    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (fetchedUsers.length === 0 && isFirstLoad) {
        seedInitialData();
        setIsLoading(false); 
      } else if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
        setSelectedUserId(prev => {
          if (!prev && fetchedUsers.length > 0) {
            const alon = fetchedUsers.find(u => u.name === 'אלון');
            return alon ? alon.id : fetchedUsers[0].id;
          }
          return prev;
        });
        setIsLoading(false);
      }
      
      setIsFetching(false);
      isFirstLoad = false;
    }, (error) => {
        console.error("Users fetch error", error);
        setIsLoading(false);
        setIsFetching(false);
    });

    const unsubProgress = onSnapshot(progressRef, (snapshot) => {
      setIsFetching(true);
      const fetchedProgress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProgressData(fetchedProgress);
      setTimeout(() => setIsFetching(false), 500);
    }, (error) => {
      console.error("Progress fetch error", error);
      setIsFetching(false);
    });

    const unsubLinks = onSnapshot(linksRef, (snapshot) => {
      const fetchedLinks = {};
      snapshot.docs.forEach(doc => {
        fetchedLinks[doc.id] = doc.data();
      });
      setCustomLinks(fetchedLinks);
    }, (error) => console.error("Links fetch error", error));

    return () => {
      unsubUsers();
      unsubProgress();
      unsubLinks();
    };
  }, [authUser]);

  const seedInitialData = async () => {
    const alonId = 'u_alon';
    const danielId = 'u_daniel';
    
    const initialUsers = [
      { id: alonId, name: 'אלון', createdAt: new Date().toISOString() },
      { id: danielId, name: 'דניאל', createdAt: new Date().toISOString() }
    ];

    const initialProgress = [
      { id: `${alonId}_t1`, userId: alonId, trailId: 't1', ebikeCount: 5, analogCount: 0 },
      { id: `${alonId}_t2`, userId: alonId, trailId: 't2', ebikeCount: 1, analogCount: 0 },
      { id: `${alonId}_t3`, userId: alonId, trailId: 't3', ebikeCount: 1, analogCount: 0 },
      { id: `${alonId}_t4`, userId: alonId, trailId: 't4', ebikeCount: 1, analogCount: 0 },
      { id: `${danielId}_t1`, userId: danielId, trailId: 't1', ebikeCount: 1, analogCount: 0 },
      { id: `${danielId}_t2`, userId: danielId, trailId: 't2', ebikeCount: 1, analogCount: 0 },
      { id: `${danielId}_t3`, userId: danielId, trailId: 't3', ebikeCount: 1, analogCount: 0 },
      { id: `${danielId}_t4`, userId: danielId, trailId: 't4', ebikeCount: 1, analogCount: 0 }
    ];

    try {
      const batch = writeBatch(db);
      initialUsers.forEach(u => batch.set(doc(usersRef, u.id), { name: u.name, createdAt: u.createdAt }));
      initialProgress.forEach(p => batch.set(doc(progressRef, p.id), { userId: p.userId, trailId: p.trailId, ebikeCount: p.ebikeCount, analogCount: p.analogCount }));
      await batch.commit();
    } catch (e) {
      console.error("Error seeding initial data", e);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !authUser) return;
    
    setIsFetching(true);
    const newUserId = `u_${Date.now()}`;
    const newUser = { name: newUserName.trim(), createdAt: new Date().toISOString() };

    try {
      await setDoc(doc(usersRef, newUserId), newUser);
      setNewUserName('');
      setIsAddingUser(false);
      setSelectedUserId(newUserId);
    } catch(err) {
      console.error("Failed to add user", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateProgress = (trailId, type, delta) => {
    if (!selectedUserId || !authUser) return;

    const progressDocId = `${selectedUserId}_${trailId}`;
    const existing = unsavedChanges[progressDocId] || progressData.find(p => p.id === progressDocId) || { id: progressDocId, userId: selectedUserId, trailId: trailId, ebikeCount: 0, analogCount: 0 };
    
    let newEbike = existing.ebikeCount;
    let newAnalog = existing.analogCount;

    if (type === 'ebike') newEbike = Math.max(0, newEbike + delta);
    if (type === 'analog') newAnalog = Math.max(0, newAnalog + delta);

    const updated = { ...existing, ebikeCount: newEbike, analogCount: newAnalog };
    
    setUnsavedChanges(curr => ({ ...curr, [progressDocId]: updated }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(unsavedChanges).length === 0 || !authUser) return;
    
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      Object.values(unsavedChanges).forEach(change => {
        batch.set(doc(progressRef, change.id), {
          userId: change.userId,
          trailId: change.trailId,
          ebikeCount: change.ebikeCount,
          analogCount: change.analogCount
        }, { merge: true });
      });
      
      await batch.commit();
      setUnsavedChanges({});
    } catch (e) {
      console.error("Error saving to db", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLinks = async (trailId) => {
    try {
      setIsSaving(true);
      await setDoc(doc(linksRef, trailId), { 
        kklLink: editKklLink, 
        reviewLink: editReviewLink 
      }, { merge: true });
      setEditingLinksId(null);
    } catch (err) {
      console.error("Error saving links", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressForTrail = (trailId) => {
    const progressDocId = `${selectedUserId}_${trailId}`;
    if (unsavedChanges[progressDocId]) {
      return unsavedChanges[progressDocId];
    }
    return progressData.find(p => p.id === progressDocId) || { id: progressDocId, userId: selectedUserId, trailId: trailId, ebikeCount: 0, analogCount: 0 };
  };

  const handleClearFilters = () => {
    setFilterRegion('הכל');
    setFilterDifficulty('הכל');
    setFilterLength('הכל');
    setFilterStatus('הכל');
    setSearchQuery('');
  };

  const stats = useMemo(() => {
    let teamTrailsDone = new Set();
    let teamKmDone = 0;
    
    const totalTrailsCount = TRAILS.length;
    const totalKmCount = TRAILS.reduce((sum, t) => sum + t.lengthKm, 0);

    const mergedProgressMap = new Map();
    progressData.forEach(p => mergedProgressMap.set(p.id, p));
    Object.values(unsavedChanges).forEach(p => mergedProgressMap.set(p.id, p));

    Array.from(mergedProgressMap.values()).forEach(p => {
      if (p.ebikeCount > 0 || p.analogCount > 0) {
        teamTrailsDone.add(p.trailId);
      }
    });

    TRAILS.forEach(t => {
      if (teamTrailsDone.has(t.id)) {
        teamKmDone += t.lengthKm;
      }
    });

    return {
      totalTrails: totalTrailsCount,
      totalKm: totalKmCount,
      doneTrails: teamTrailsDone.size,
      doneKm: teamKmDone,
      leftTrails: totalTrailsCount - teamTrailsDone.size,
      leftKm: totalKmCount - teamKmDone
    };
  }, [progressData, unsavedChanges]);

  const filteredTrails = useMemo(() => {
    return TRAILS.filter(t => {
      const matchRegion = filterRegion === 'הכל' || t.region === filterRegion;
      const matchDifficulty = filterDifficulty === 'הכל' || t.difficulty.includes(filterDifficulty);
      const matchSearch = t.name.includes(searchQuery) || t.popularity.includes(searchQuery);

      let matchLength = true;
      if (filterLength === 'קצר') matchLength = t.lengthKm <= 15;
      else if (filterLength === 'בינוני') matchLength = t.lengthKm > 15 && t.lengthKm <= 30;
      else if (filterLength === 'ארוך') matchLength = t.lengthKm > 30;

      const userProg = getProgressForTrail(t.id);
      const isDone = (userProg.ebikeCount + userProg.analogCount) > 0;
      const matchStatus = filterStatus === 'הכל' || (filterStatus === 'בוצע' && isDone) || (filterStatus === 'לא בוצע' && !isDone);

      return matchRegion && matchDifficulty && matchSearch && matchLength && matchStatus;
    });
  }, [filterRegion, filterDifficulty, searchQuery, filterLength, filterStatus, progressData, unsavedChanges, selectedUserId]);

  const getDifficultyColor = (diff) => {
    if (diff.includes('קל')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (diff.includes('בינוני')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (diff.includes('קשה')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (diff.includes('מומחה')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center text-center max-w-sm w-full border border-slate-200">
          <div className="bg-emerald-100 p-4 rounded-full mb-6">
            <Bike className="w-12 h-12 text-emerald-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">מכין את המסלולים...</h2>
          <p className="text-slate-500 text-sm">מתחבר לשרת ומושך את הנתונים, מיד מתחילים לדווש!</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32 md:pb-24 relative">
      
      {(isFetching || isSaving) && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-emerald-100 z-50 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full"></div>
        </div>
      )}

      {Object.keys(unsavedChanges).length > 0 && (
        <div className="fixed bottom-6 md:bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="pointer-events-auto w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 sm:py-3.5 rounded-full shadow-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 border-4 border-slate-700/20"
          >
            {isSaving ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /> : <Save className="w-5 h-5 text-emerald-400" />}
            {isSaving ? 'שומר בשרת...' : `שמור ${Object.keys(unsavedChanges).length} שינויים במסד הנתונים`}
          </button>
        </div>
      )}

      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-10 pt-1.5">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Bike className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">מעקב סינגלים קק״ל</h1>
                <p className="text-emerald-100 text-sm">פרויקט כיבוש המסלולים של ישראל</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20 w-full sm:w-auto">
              <span className="text-sm text-emerald-50 whitespace-nowrap">רוכב מציג:</span>
              <select 
                className="bg-white text-emerald-900 rounded-lg px-3 py-2 sm:py-1.5 outline-none font-medium text-sm flex-1 sm:w-32 cursor-pointer"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="p-2 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                title="הוסף רוכב חדש"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isAddingUser && (
            <form onSubmit={handleAddUser} className="mt-4 flex gap-2 w-full sm:max-w-sm sm:ml-auto animate-in fade-in slide-in-from-top-4">
              <input 
                type="text" 
                placeholder="שם הרוכב החדש..." 
                className="flex-1 rounded-lg px-3 py-2.5 sm:py-2 text-slate-800 text-sm outline-none border border-emerald-400 focus:ring-2 focus:ring-emerald-400"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <button type="submit" className="bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors">
                הוסף
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold">יעד קבוצתי: לכבוש את כולם!</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>מסלולים שסיימנו</span>
                <span className="text-emerald-600">{stats.doneTrails} / {stats.totalTrails}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                  style={{ width: `${(stats.doneTrails / stats.totalTrails) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">נשארו עוד {stats.leftTrails} מסלולים כדי להשלים את היעד.</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>קילומטראז' מצטבר</span>
                <span className="text-amber-600">{stats.doneKm} / {stats.totalKm} ק"מ</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-l from-amber-400 to-amber-600 transition-all duration-1000 ease-out"
                  style={{ width: `${(stats.doneKm / stats.totalKm) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">רחוקים {stats.leftKm} קילומטרים מסיום כלל הסינגלים.</p>
            </div>
          </div>
        </section>

        {/* Filters Section (Optimized for Mobile) */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap flex-1 gap-2 w-full md:w-auto">
            
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full sm:w-auto sm:min-w-[110px] cursor-pointer"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="הכל">כל הסטטוסים</option>
              <option value="בוצע">✅ בוצעו</option>
              <option value="לא בוצע">⏳ לא בוצעו</option>
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full sm:w-auto sm:min-w-[110px] cursor-pointer"
              value={filterLength}
              onChange={e => setFilterLength(e.target.value)}
            >
              <option value="הכל">כל האורכים</option>
              <option value="קצר">עד 15 ק"מ</option>
              <option value="בינוני">15-30 ק"מ</option>
              <option value="ארוך">מעל 30 ק"מ</option>
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full sm:w-auto sm:min-w-[110px] cursor-pointer"
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
            >
              <option value="הכל">כל האזורים</option>
              {[...new Set(TRAILS.map(t => t.region))].sort().map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 sm:px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full sm:w-auto sm:min-w-[110px] cursor-pointer"
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
            >
              <option value="הכל">כל הרמות</option>
              <option value="קל">קל</option>
              <option value="בינוני">בינוני</option>
              <option value="קשה">קשה</option>
              <option value="מומחה">מומחה</option>
            </select>

            <button 
              onClick={handleClearFilters}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors shrink-0"
              title="נקה פילטרים"
            >
              <FilterX className="w-4 h-4" />
              נקה סינון
            </button>
          </div>

          <div className="w-full md:w-72 relative shrink-0">
            <input 
              type="text" 
              placeholder="חיפוש סינגל..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 sm:py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Activity className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </section>

        {/* View Mode Toggles */}
        <div className="flex justify-end pt-2">
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 shadow-sm w-full sm:w-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutGrid className="w-4 h-4" /> רשימה
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'map' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LucideMap className="w-4 h-4" /> מפה חיה
            </button>
          </div>
        </div>

        {/* Dynamic Rendering Based on View Mode */}
        {viewMode === 'map' ? (
          <section className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 h-[450px] md:h-[600px] w-full relative z-0">
            <MapView 
              trails={filteredTrails}
              getProgressForTrail={getProgressForTrail}
              setViewMode={setViewMode}
              setSearchQuery={setSearchQuery}
            />
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrails.map(trail => {
              const userProg = getProgressForTrail(trail.id);
              const isDone = (userProg.ebikeCount + userProg.analogCount) > 0;
              const hasUnsavedChanges = !!unsavedChanges[`${selectedUserId}_${trail.id}`];
              
              const currentKklLink = customLinks[trail.id]?.kklLink ?? trail.kklLink;
              const currentReviewLink = customLinks[trail.id]?.reviewLink ?? trail.reviewLink;
              const isEditingLinks = editingLinksId === trail.id;

              const hasKklLink = currentKklLink && currentKklLink.trim() !== '';
              const hasReviewLink = currentReviewLink && currentReviewLink.trim() !== '';
              const noLinks = !hasKklLink && !hasReviewLink;

              return (
                <div 
                  key={trail.id} 
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden relative
                    ${isDone ? 'border-emerald-400 shadow-md ring-1 ring-emerald-400/20' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
                >
                  {hasUnsavedChanges && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-bl-lg shadow-sm" title="שינויים לא שמורים" />
                  )}

                  <div className="p-5 border-b border-slate-100 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                        {trail.name}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 mr-2 ${getDifficultyColor(trail.difficulty)}`}>
                        {trail.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate" title={trail.region}>אזור {trail.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Route className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{trail.lengthKm} ק"מ</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mountain className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{trail.elevationM} מ' טיפוס</span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="flex gap-2">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        {trail.popularity || 'אין מידע נוסף למסלול זה.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50/50 flex flex-col gap-4">
                    
                    <div className="flex items-center justify-between bg-white p-2.5 sm:p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 pl-2">
                        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
                          <Battery className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">חשמלוק</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                          onClick={() => handleUpdateProgress(trail.id, 'ebike', -1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={userProg.ebikeCount === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-5 sm:w-4 text-center font-bold text-lg">{userProg.ebikeCount}</span>
                        <button 
                          onClick={() => handleUpdateProgress(trail.id, 'ebike', 1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 sm:p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 pl-2">
                        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600">
                          <Bike className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">אנלוגיות</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                          onClick={() => handleUpdateProgress(trail.id, 'analog', -1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={userProg.analogCount === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-5 sm:w-4 text-center font-bold text-lg">{userProg.analogCount}</span>
                        <button 
                          onClick={() => handleUpdateProgress(trail.id, 'analog', 1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditingLinks ? (
                      <div className="mt-2 flex flex-col gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-600 mb-1">עריכת קישורים (נשמר לכולם):</div>
                        <input 
                          type="url" 
                          value={editKklLink} 
                          onChange={e => setEditKklLink(e.target.value)}
                          placeholder="קישור קק״ל (או אתר רשמי)..."
                          className="w-full text-left text-sm p-2 rounded border border-slate-300 outline-none focus:border-emerald-500" dir="ltr"
                        />
                        <input 
                          type="url" 
                          value={editReviewLink} 
                          onChange={e => setEditReviewLink(e.target.value)}
                          placeholder="קישור לחוות דעת / מפה..."
                          className="w-full text-left text-sm p-2 rounded border border-slate-300 outline-none focus:border-emerald-500" dir="ltr"
                        />
                        <div className="flex gap-2 mt-1">
                          <button 
                            onClick={() => handleSaveLinks(trail.id)}
                            className="flex-1 bg-emerald-600 text-white text-sm py-2 sm:py-1.5 rounded-lg hover:bg-emerald-700 transition"
                          >
                            שמור
                          </button>
                          <button 
                            onClick={() => setEditingLinksId(null)}
                            className="flex-1 bg-white border border-slate-300 text-slate-600 text-sm py-2 sm:py-1.5 rounded-lg hover:bg-slate-50 transition"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        {hasKklLink && (
                          <a 
                            href={currentKklLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            אתר קק״ל
                          </a>
                        )}
                        
                        {hasReviewLink && (
                          <a 
                            href={currentReviewLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            חוות דעת
                          </a>
                        )}

                        <button 
                          onClick={() => {
                            setEditingLinksId(trail.id);
                            setEditKklLink(currentKklLink || '');
                            setEditReviewLink(currentReviewLink || '');
                          }}
                          title="ערוך קישורים למסלול זה"
                          className={`flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm ${noLinks ? 'flex-1 py-2.5 sm:py-2 gap-2 text-sm' : 'w-12 sm:w-10'}`}
                        >
                          <Pencil className="w-4 h-4" />
                          {noLinks && <span>הוסף קישורים למסלול</span>}
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </section>
        )}

        {filteredTrails.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Route className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>לא נמצאו מסלולים התואמים לחיפוש שלך.</p>
          </div>
        )}

      </main>
    </div>
  );
}
