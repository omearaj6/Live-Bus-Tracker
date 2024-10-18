# School of Computing  
**CA326 Year 3 Project Proposal Form**

## SECTION A

### Project Title: 
**Live Bus Tracker with Crowdsourcing**

### Team Members:
- **Student 1 Name:** James O’Meara  
  **ID Number:** 22396256  
- **Student 2 Name:** Michael Cojucaru  
  **ID Number:** 22380876  
- **Student 3 Name:** ______________________________  
  **ID Number:** ___________  
*(A third team member is exceptional and requires detailed justification.)*

### Staff Member Consulted:
**Hyowon Lee**

---

## Project Description:

### Description: 
Our 3rd-year project is a website showing a live map of buses that allows users to report when buses are running late or early, improving the accuracy of bus arrival estimates. While Dublin Bus does have GPS tracking on their buses, it’s often inaccurate. By incorporating real-time user reports, the website will offer more accurate predictions of when buses are expected to arrive at each stop. User-reported delays can be shown on the map in real-time.

Simplicity and ease of use are important parts of the app. We are focused on developing a user-friendly interface that allows users to quickly report late buses without navigating through complex steps or cluttered menus. This design will encourage more users to submit reports, increasing the volume of data available and further enhancing the accuracy of the website's predictions.

We will be using **Leaflet.js** and **OpenStreetMap** to create the map interface, allowing users to see buses and stops located nearby. **ReactJS** will be used for the frontend, while **Django** will be used for the backend. Django provides compatibility to query databases, but tools like **PostgreSQL** may be needed in conjunction with the API provided by **Transport for Ireland** (TFI) for live bus tracking.

### Example Scenario:
James takes a Dublin Bus to get to college. The live GPS bus tracking information provided by TFI is not available on this particular bus. The bus is shown to arrive at 9:05 but doesn’t arrive at his stop until 9:20. James reports this delay on our website, where it is recorded and the bus’s schedule is adjusted accordingly. As the bus approaches Michael’s stop, he will see the more accurate arrival time for the bus and can plan his journey more precisely.

---

## Division of Work:
We’ll both be working together on the frontend and backend. James will create the map interface, while Michael will work on live tracking and user reports, but we will both be continuously communicating with each other. As we undergo the project, we will divide tasks according to each group member’s expertise.

---

## Programming Languages:
- HTML/CSS  
- JavaScript  
- Python  
- SQL  

## Programming Tools:
- **ReactJS**  
- **Django**  
- **OpenStreetMap**  
- **Leaflet.js**  
- **General Transit Feed Specification (GTFS) Realtime TFI API**  
- **PostgreSQL**  

---

## Learning Challenges:
**Leaflet.js** and **OpenStreetMap** are new software applications for us, and figuring out how to use the information and features provided will be a challenge. Real-time data processing of GTFS Realtime onto our map will be a challenge, as well as incorporating user reports.

---

## Hardware/Software Platform:
The web application will be developed on Unix-based machines, and it will be important to ensure the application works on mobile devices.
