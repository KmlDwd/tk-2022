# Component based local filesystem image finder

The purpose of this app is to integrate many external components into one REST-based application that allows browsing local directories for images that fulfill certain criteria. The app will be distributed between a few instances that share the load of image processing and communicate via REST. Besides the backend search architecture, the app also features a web-based interface for defining the search criteria and displaying the results.

The project is developed for the "Component Technologies" class at AGH University of Science and Technology.

# Some example criteria would be:

- **Metadata** - when a photo was taken, who took the photo
- **Contents of an image** - Does the image contain people? Does it have any plants in it?
- **Text** - Find images containing certain text.

# Graphical interface

## Overview

Graphical allows the user to search recursively for images in a given path.

The interface is minimalistic, consisting only of three components:
 - The path input field,
 - The module controls,
 - The result list.

![image](https://user-images.githubusercontent.com/58555777/166555841-82596157-67d2-462a-8c7e-cf22c1b58834.png)

The query can be additionally supplied with additional criteria via the module controls. those modules include: 
 - The metadata module - EXIF based,![image](https://user-images.githubusercontent.com/58555777/166554899-53e1073e-12ce-4a45-b5f0-5449a20b5e07.png)
 - The text content module - searching for images including the text of a given length or specific sentences,![image](https://user-images.githubusercontent.com/58555777/166555115-f3ecce50-88cc-4f3c-b993-2e1ff651a80e.png)
 - The weather module - TODO,


## Building and running the interface

Prerequisites:
 - [NodeJS](https://nodejs.dev/) - v16.14.1 or greater,

To build the interface, firstly go to the /ui subdirectory:
    
    $ cd ui
Then install all dependencies:
    
    $ npm install
And lastly, run the dev build script:

    $ npm run dev


## UI project structure

The interface is written in svelte and typescript and is stored in the `/ui` subdirectory of the repository.

The GUI currently consists of 3 components:
 - `Form` - contains the search bar and the search module controls definitions, sends queries for images to the backend,
 - `ResultsList` - displays and filters the found images,
 - `ImageFinder` - a wrapper component for the other components.

As well as the following util scripts:
 - `flashOptions` - translates EXIF flash number codes to readable text,
 - `request.utils` - contains the logic for communicating with the backend server.

The dependencies, building and running scripts are defined in the standard `package.json` file.

# Backend architecture

## Overview

The backend consists of a master node that receives queries from the GUI and propagates requests to module nodes that filter the query results in a pipeline.

The server expects a request containing a **directory** and an object with the **module options**. When a new request is received, the **master node** searches recursively in the specified directory for images. When the node finds a **batch** (size 10) of images it creates a **request pipeline** defined in the **options object** and sends it to the **module nodes**. The nodes process the batch in sequence, while the **master node** sends in new **batches** as it finds them. Each processed batch is collected by the master node and added to the **result list**. After all batches have been processed, the **result list** is returned to the **GUI**.

![image](https://user-images.githubusercontent.com/58555777/166975490-594d0e00-70d4-4a37-b7e9-77f0a6c8c0af.png)

## Building and running the server

Prerequisites:
 - [NodeJS](https://nodejs.dev/) - v16.14.1 or greater,
 - [Elixir](https://elixir-lang.org/) - v1.13.4 or greater,
 - [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) - v4.1.0.

Building the backend requires building each node.

### Master and metadata nodes (NodeJS):
    
    $ cd server
Then install all dependencies:
    
    $ npm install
Run the nodes:

    $ npm run start
    
Testing the nodes:

    $ npm run test
    
### Text node (Elixir):
    
    $ cd text_server
Build steps:
    
    $ mix local.hex
    $ mix deps.get

Running text node:
    
    $ iex -S mix
    
Testing text node:

    $ mix test

## Backend project structure


