# Park&starf;Sky
Allows a user to search for any national park for a given visitation date in the US. It not only displays general information and a brief summary for each park, but also presents the user with a star chart of what the night sky will look like at that park on a specific date, and general weather information provided by the National Parks Service. Park-specific and Near-Earth-Object alerts are both displayed via modal.

## Table of Contents
* Objective
* Technologies Used
* Processes
* Future Development
* Deployment

### Objective
We were tasked with building an interactive app with a CSS framework other than Bootstrap. It required the use of at least two server-side API's and local storage. The final project then had to be deployed via GitHub pages.

![park-sky-app-screenshot] (/assets/img/screencapture.png?raw=true)

### Technologies Used
* JavaScript/jQuery/AJAX
  - Fotorama plugin
* HTML
* CSS: Foundation by Zurb
* Git/GitHub
* API's: National Park Service, Wikipedia, NASA NeoWs
* Star Chart code forked from ytliu0's Star Charts: https://github.com/ytliu0/starCharts

### Processes
- Tested API calls
- Built HTML and CSS Foundation files
- Applied DRY principles by utilizing reusable JavaScript functions for each page
- Linked park images and data, including closures and alerts, with individual park selections
- Incorporated the Star Chart, which uses the latitude and longitude from the selected park
- Added the Fotorama gallery plugin to display park images returned by the NPS API
- Utilized a multitude of NPS API endpoints to retrieve various data endpoints

### Future Development
* Update font options
* Regionally-based dropdown menu for parks
* Interactive map on homepage to search by region or individual park
* Additional Near-Earth-Object data (comets and other celestial bodies)
* Add tags for additional park info (e.g. pets allowed, amenities, other activities, etc.)

### Deployment
https://vantango.github.io/uw-project1-parksky-app/

### Repository
https://github.com/vantango/uw-project1-parksky-app





