

function findTypesOfNeabyPlaces(coord, rad, supportedTypes, map, processResult){

        const service = new google.maps.places.PlacesService(map);

        let typesLeftToCheck = supportedTypes.length;
        const nearbyTypes = new Array();

        supportedTypes.forEach(element => {
            
            const request = {
                location: coord,
                radius: `${rad}`,
                type: [element]
            }

            service.nearbySearch(request, results => {

                if(results.length > 0){
                    nearbyTypes.push(element);
                }

                typesLeftToCheck--;
                if(typesLeftToCheck <= 0){
                    processResult(nearbyTypes);
                }

            });

        });        

}