import L from 'leaflet';

/**
 * Custom SVG / HTML DivIcons for Leaflet
 * Avoids broken default image icon assets.
 */

export const createVehicleIcon = (category = 'Uber Go', heading = 0, isOnline = true) => {
  let bgColor = '#000000';
  let accentColor = '#276EF1';
  let innerSvg = '';

  if (category === 'Uber Moto') {
    bgColor = '#0F172A';
    accentColor = '#F59E0B'; // Amber
    // Real Motorcycle / Bike SVG
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="5" cy="18" r="3"/>
        <circle cx="19" cy="18" r="3"/>
        <path d="M12 18V8l3-3h3"/>
        <path d="m9 13 3-5"/>
        <path d="M14 13h5"/>
      </svg>
    `;
  } else if (category === 'Uber Auto') {
    bgColor = '#064E3B';
    accentColor = '#FBBF24'; // Yellow-Green Auto
    // 3-Wheeled Auto-Rickshaw SVG
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="18" r="2.5"/>
        <circle cx="18" cy="18" r="2.5"/>
        <path d="M3 14V9a2 2 0 0 1 2-2h9l3 4v3H3z"/>
        <path d="M10 7v7"/>
        <path d="M5 18h11"/>
      </svg>
    `;
  } else if (category === 'Uber Premier') {
    bgColor = '#000000';
    accentColor = '#F59E0B'; // Gold
    // Luxury Sedan SVG
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    `;
  } else if (category === 'Uber XL') {
    bgColor = '#1E293B';
    accentColor = '#38BDF8'; // Sky Blue
    // SUV / Van SVG
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="4" width="22" height="12" rx="2"/>
        <circle cx="6" cy="18" r="2"/>
        <circle cx="18" cy="18" r="2"/>
        <path d="M1 10h22"/>
      </svg>
    `;
  } else if (category === 'Uber Green') {
    bgColor = '#064E3B';
    accentColor = '#10B981'; // Emerald Green
    // Electric EV Car SVG
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    `;
  } else {
    // Uber Go (Compact Sedan)
    bgColor = '#111827';
    accentColor = '#276EF1';
    innerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    `;
  }

  const svgContent = `
    <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease; display: flex; align-items: center; justify-content: center; position: relative;">
      <!-- Vehicle Circular Disc -->
      <div style="
        width: 32px;
        height: 32px;
        background: ${bgColor};
        border: 2px solid ${accentColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        ${innerSvg}
      </div>

      <!-- Heading Directional Arrow -->
      <div style="
        position: absolute;
        top: -6px;
        width: 0; 
        height: 0; 
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 6px solid ${accentColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgContent,
    className: 'custom-vehicle-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const createPickupIcon = () => {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="
        width: 22px;
        height: 22px;
        background: #05944F;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(5, 148, 79, 0.25), 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
      <div style="
        background: #05944F;
        color: white;
        font-family: sans-serif;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 4px;
        margin-top: 2px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">PICKUP</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-pickup-div-icon',
    iconSize: [50, 42],
    iconAnchor: [25, 21],
  });
};

export const createDropoffIcon = () => {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="
        width: 22px;
        height: 22px;
        background: #000000;
        border: 3px solid #FFFFFF;
        border-radius: 6px;
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
      </div>
      <div style="
        background: #000000;
        color: white;
        font-family: sans-serif;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 4px;
        margin-top: 2px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">DROPOFF</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-dropoff-div-icon',
    iconSize: [50, 42],
    iconAnchor: [25, 21],
  });
};

export const createStopIcon = (stopNumber = 1) => {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="
        width: 22px;
        height: 22px;
        background: #276EF1;
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(39, 110, 241, 0.25), 0 4px 8px rgba(0,0,0,0.25);
        color: white;
        font-family: sans-serif;
        font-size: 11px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${stopNumber}
      </div>
      <div style="
        background: #276EF1;
        color: white;
        font-family: sans-serif;
        font-size: 8px;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        margin-top: 1px;
      ">STOP ${stopNumber}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-stop-div-icon',
    iconSize: [44, 40],
    iconAnchor: [22, 20],
  });
};

export const createDriverGPSIcon = (heading = 0) => {
  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <!-- Outer pulsing ring -->
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        background: rgba(39, 110, 241, 0.2);
        border: 2px solid #276EF1;
        border-radius: 50%;
        animation: pulseSubtle 2s infinite ease-in-out;
      "></div>

      <!-- Center GPS Dot -->
      <div style="
        width: 22px;
        height: 22px;
        background: #276EF1;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(39, 110, 241, 0.5);
        transform: rotate(${heading}deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 7px solid white;
          margin-top: -2px;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-driver-gps-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};
