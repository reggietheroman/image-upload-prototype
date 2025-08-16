# Image Upload

A simple protoype image manipulator using nodejs

## Requirements

- accept an image file via a POST request
- accept only image file types
- accept images only under a certain size (take best practice for this and suggest a size)
- convert the image to webp (context for this requirement is that the image must be the smallest file size with the least quality lost)

## Run

`npm start`

## Try it out

```
curl -X POST "http://localhost:3000/convert" \
  -F "image=@./test_images/your-test-image.jpg" \
  -o out.webp
```

## To Do

### Original scope
- [ ] Add config file
- [ ] Add resolutions file for quick list of max height and width for converted image
- [x] Break up index.js file

### Scope creep
- [x] Clean up convert.js and upload.js files (maybe use classes)
- [ ] Move the express.js functions out of the index.js file also