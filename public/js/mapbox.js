/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);//because the locations are in the data-locations attribute value
//console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoic2pvc2VwaHJ3IiwiYSI6ImNrMHoyMTNhdTA0dmwzb29rMzJ6MmhheHgifQ.7k87MQOkuWEhPM1PiEWZUA';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/sjosephrw/ck0z2ktu10wlt1cqswvhy9ary',
scrollZoom: false //allow panning but not zooming
// center: [longitude, latitude],//with mapbox longitude comes 1st then the latitude
// zoom: 10,//zoom level
// interactive: false//to preventing panning and zooming the map with the mouse
});

//can you see the commented code above
//that is to display the map with the location coordinates manually
//to display it automatically
const bounds = new mapboxgl.LngLatBounds();

//each tour will have multiple locations so we are looping through all of them and displaying a green pin png on each location
locations.forEach(loc => {
    //add marker for each location coordinates, because the a single tour will have several travelling locations
    const el = document.createElement('div');
    el.className = 'marker';   

    //add marker for each location coordinates, because the a single tour will have several travelling locations
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'//the bottom of the green pin png image to be on the location other options - top, center etc.
      }).setLngLat(loc.coordinates)
        .addTo(map);
  
      // Add popup to each location that holds the day and description
      new mapboxgl.Popup({
        offset: 30
      }).setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
  
      // Extend map bounds to include current location
      bounds.extend(loc.coordinates);    
    
});

//make the map fit the bounds - bounds.extend(loc.coordinates);   
map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
