
<!-- PROJECT LOGO -->
<br />

  <h1 align="center">Home Food</h1>

### Demo Link

[HOME FOOD](https://pesto-home-food-backend.herokuapp.com/api/v1)
<li>To access the Application with demo data please login using the following Credentials</li>

#### Admin 
<li>Phone : 7741084950</li>
<li>OTP : 123456</li>

#### Seller 
<li>Phone : 7210786647 </li>
<li>OTP : 123455</li>

#### Customer 
<li>Phone : 7741084950</li>
<li>OTP : 123456</li>
<li>pincode : 500000</li>

<!-- TABLE OF CONTENTS -->

  <summary><h3 style="display: inline-block">Table of Contents</h3></summary>
<details open="open">
<ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
         <li><a href="#resources">Resources</a></li>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#tools-and-libraries-used">Tools and Libraries Used<a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#schema-design">Schema Design</a></li>
        <li><a href="#road-map">Road Map</a></li>
      </ul>
    </li>
   
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

- Serving home food anywhere to customers at low cost and High quality.
- Reaching places where restaurants are not available.
- Providing employment for the individual who can make food at home.

### Features
  
### Resources
- [Front-End git repository](https://github.com/pesto-students/n3-home-food-frontend-Theta)
- [Postman Api Documentation](https://documenter.getpostman.com/view/16227165/Tzm5GbvK)
- [PRD](https://drive.google.com/file/d/1Vx6rk5sD8S4teRjC3GvpJQ161Ww8kAkv/view?usp=sharing)
  
### Built With

- [AWS-S3 bucket](https://aws.amazon.com/s3/)
- [Heroku](https://www.heroku.com)
- [MongoDB](https://www.mongodb.com/cloud/atlas)
- [Node.js](https://nodejs.org/en/)

### Tools and Libraries Used

- [Razorpay](https://razorpay.com/)
- [For Security]()
  
  1. <b>Firebase</b> - Firebase - helps us Develop simple, free multi-platform sign-in for our Users.
  2. <b>JWT</b> - JWT allows the user to access routes, services, and resources that are permitted with that token.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/pesto-students/n3-home-food-backend-Theta
   ```
2. Install NPM packages

   ```sh
   npm install
   ```

3. Add the `.env` file in the root
   ```
      API_URL = api/v1
      CONNECTION_STRING = ******
      ADMIN_SECRET = 'ADMIN'
      SELLER_SECRET = 'SELLER'
      USER_SECRET = 'USER'
      DB_NAME = 'home-food'
      PORT = 8000

      AWS_BUCKET_NAME = "pesto-home-food"
      AWS_BUCKET_REGION="ap-south-1"
      AWS_ACCESS_KEY = ******
      AWS_SECRET_KEY=******
  
      RAZORPAY_KEY_ID = *******
      RAZORPAY_KEY_SECRET = *******

   ```
4. Run the project
   ```sh
   npm start
   ```


<!-- USAGE EXAMPLES -->




  
### Schema Design

<img src="https://github.com/pesto-students/n3-home-food-frontend-Theta/blob/master/public/database%20architecture.png" >
  
### Road Map  
<img src="https://github.com/pesto-students/n3-home-food-frontend-Theta/blob/release/week4/public/roadmap.png" >


<!-- CONTACT -->

## Contact
  
Sahil Thakare - sahilthakare521@gmail.com
Kapil Sharma - kapilsh2014@gmail.co
  
  <!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

  
<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.
  
