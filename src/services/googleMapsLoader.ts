/**
 * Dynamic loader for Google Maps JavaScript API
 */

let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  // Already loaded
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      loadPromise = null;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
