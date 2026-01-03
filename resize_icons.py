from PIL import Image
import os

try:
    img = Image.open("icon128.png")
    
    # Crop to bounding box of non-transparent pixels
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped image to {bbox}")
    
    # Resize back to 128x128 to keep the source file standard, or just use the cropped version for resizing?
    # The user wants the icon to be "big" in the small slots. 
    # So we should resize the *cropped* content to fill the target squares.
    
    # Let's save the optimized (cropped) version as icon128.png but resized to fit 128x128 square while maintaining aspect ratio?
    # Or better: Just use the cropped image as the source for resizing to 16, 32, 48.
    # But we also need a 128 version.
    
    # Helper to resize and center in square
    def resize_contain(image, size):
        img_ratio = image.width / image.height
        target_ratio = 1.0
        
        if target_ratio > img_ratio:
            # Fit by height
            new_height = size
            new_width = int(size * img_ratio)
        else:
            # Fit by width
            new_width = size
            new_height = int(size / img_ratio)
            
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        paste_x = (size - new_width) // 2
        paste_y = (size - new_height) // 2
        new_img.paste(resized, (paste_x, paste_y))
        return new_img

    # Save the optimized 128 version
    icon128 = resize_contain(img, 128)
    icon128.save("icon128.png")
    print("Updated icon128.png")

    sizes = [16, 32, 48]
    for size in sizes:
        # Resize the cropped content to fill the square as much as possible
        icon_sized = resize_contain(img, size)
        icon_sized.save(f"icon{size}.png")
        print(f"Created icon{size}.png")
        
except Exception as e:
    print(f"Error: {e}")
