# Art Gallery

![CI](https://github.com/skvortsov-ivan/ArtGallery/actions/workflows/ci.yml/badge.svg)
![codecov](https://codecov.io/gh/skvortsov-ivan/ArtGallery/branch/dev/graph/badge.svg)

## Description

Art Gallery is a responsive web application for displaying and browsing a collection of images organized into categories. Built with HTML, CSS, and JavaScript, it features dynamic filtering by category and tags, lazy loading for performance, and a modal viewer with navigation for full-size images. The project uses a static JSON file for mock data and includes unit tests with Jest for code quality.

## Installation

1. Clone the repository into Visual Studio Code: https://github.com/skvortsov-ivan/ArtGallery.git
2. Install dependencies: npm install
3. Open with live share extension from Microsoft.

## Usage

- Open the app in a browser.
- Browse all images or filter by category using the tabs (All, Animals, Religious Architecture, Geometry, Quirky).
- Use the search input to filter by tags (case-insensitive, partial matches).
- Click a thumbnail to open the full image in a modal.
- Navigate with arrows in the modal or close it.

Images are loaded from `images.json` and can be found in `./images/` and `./thumbnails/` folders.
