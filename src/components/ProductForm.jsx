import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductForm.css";
import Button from "./Button";

function ProductForm({ reloadPage, editProduct }) {
  const navigate = useNavigate();


  const [productName, setProductName] = useState("");
  const [Description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Material, setMaterial] = useState("");
  const [Length, setLength] = useState("");
  const [Width, setWidth] = useState("");
  const [Height, setHeight] = useState("");
  const [SizeUnit, setSizeUnit] = useState("");
  const [weight, setWeight] = useState("");
  const [Surface, setSurface] = useState("");
  const [WeightUnit, setWeightUnit] = useState("");
  const [images, setImages] = useState(Array(6).fill(null));
  const [changedIndexes, setChangedIndexes] = useState([]);
  const [Price, setPrice] = useState("");
  const [Stock, setStock] = useState("");

  const handleImage = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    setChangedIndexes((prev) => {
      if (prev.includes(index)) return prev;
      return [...prev, index];
    });

    e.target.value = "";
  };
  // setImages(files);
  //     // Allows selecting the same file again later if needed
  //     e.target.value = "";
  //   };

  useEffect(() => {
    if (editProduct) {
      setProductName(editProduct.productName || "");
      setDescription(editProduct.description || "");
      setCategory(editProduct.category || "");
      setMaterial(editProduct.material || "");

      setLength(editProduct.length ?? "");
      setWidth(editProduct.width ?? "");
      setHeight(editProduct.height ?? "");

      setSizeUnit(editProduct.sizeUnit || "");
      setWeight(editProduct.weight ?? "");
      setSurface(editProduct.surface || "");
      setWeightUnit(editProduct.weightUnit || "");
      setPrice(editProduct.price ?? "");
      setStock(editProduct.stock ?? "");

      const imageSlots = Array(6).fill(null);

      editProduct.images.forEach((img, index) => {
        if (index < 6) {
          imageSlots[index] = img;
        }
      });

      setImages(imageSlots);
    } else {
      setImages(Array(6).fill(null));
    }
  }, [editProduct]);

  const Delete = () => {
    localStorage.setItem("isSeller", "false");
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked");
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("productName", productName);
    formData.append("Description", Description);
    formData.append("Category", Category);
    formData.append("Material", Material);
    formData.append("Length", Length);
    formData.append("Width", Width);
    formData.append("Height", Height);
    formData.append("SizeUnit", SizeUnit);
    formData.append("weight", weight);
    formData.append("Surface", Surface);
    formData.append("WeightUnit", WeightUnit);
    formData.append("Price", Price);
    formData.append("Stock", Stock);

    // Add all images
    changedIndexes.forEach((index) => {
      formData.append("images", images[index]);
      formData.append("indexes", index);
    });

    let res;

    if (editProduct) {
      res = await fetch(`http://localhost:5000/product/${editProduct._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      res = await fetch("http://localhost:5000/productForm", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    // 💡 FIX 2: Add parentheses here
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      reloadPage();
    }
  };

  return (
    <div className="productForm">
      <div className="info">
        <h2>List a 3D Printed Model</h2>
        <h3>Fill in the details below to put your model up for sale.</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="sub">
          <h2 className="basic">Basic Information</h2>

          <div className="inputField">
            <h1>Product Name</h1>
            <input
              type="text"
              placeholder="e.g. Articulated Dragon, Iron Man Helmet, Pikachu Figure"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="inputField">
            <h1>Description</h1>
            <textarea
              placeholder="Describe your model, its purpose, material, print quality, colors, and any special features..."
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="one">
            <div className="inputField">
              <h1>Category</h1>
              <select
                value={Category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="figurines">Figurines</option>
                <option value="miniatures">Miniatures</option>
                <option value="home-decor">Home Decor</option>
                <option value="toys">Toys</option>
                <option value="cosplay">Cosplay Props</option>
                <option value="gaming">Gaming Accessories</option>
                <option value="keychains">Keychains</option>
                <option value="planters">Planters</option>
                <option value="tools">Tools & Holders</option>
                <option value="phone-accessories">Phone Accessories</option>
                <option value="art">Art & Sculptures</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="inputField">
              <h1>Material</h1>
              <select
                value={Material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="">Select material</option>
                <option value="PLA">PLA</option>
                <option value="PLA+">PLA+</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU (Flexible)</option>
                <option value="ASA">ASA</option>
                <option value="Resin">Resin</option>
                <option value="Nylon">Nylon</option>
                <option value="Carbon Fiber">Carbon Fiber</option>
                <option value="Wood PLA">Wood PLA</option>
                <option value="Metal Filled">Metal Filled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sub">
          <h2 className="basic">Specification</h2>
          <div className="inputField">
            <h1>Length</h1>
            <input
              type="number"
              placeholder="e.g. 150"
              value={Length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>

          <div className="inputField">
            <h1>Width</h1>
            <input
              type="number"
              placeholder="e.g. 80"
              value={Width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>

          <div className="inputField">
            <h1>Height</h1>
            <input
              type="number"
              placeholder="e.g. 120"
              value={Height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="inputField">
            <h1>Unit</h1>
            <select
              value={SizeUnit}
              onChange={(e) => setSizeUnit(e.target.value)}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>

          <div className="inputField">
            <h1>Weight</h1>
            <input
              type="number"
              placeholder="e.g. 250"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="inputField">
            <h1>Unit</h1>
            <select
              value={WeightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
            </select>
          </div>

          <div className="inputField">
            <h1>Surface finish</h1>
            <input
              type="text"
              placeholder="e.eg.Sanded,Pained,Vanished"
              value={Surface}
              onChange={(e) => setSurface(e.target.value)}
            />
          </div>
        </div>

        <div className="sub">
  <h2 className="basic">💲Price & Stock</h2>

  <div className="inputField">
    <h1>Price</h1>

    <input
      type="number"
      min="0"
      placeholder="e.g. 799"
      value={Price}
      onChange={(e) => setPrice(e.target.value)}
      required
    />
  </div>

  <div className="inputField">
    <h1>Stock</h1>

    <input
      type="number"
      min="0"
      placeholder="e.g. 10"
      value={Stock}
      onChange={(e) => setStock(e.target.value)}
      required
    />

    <p className="input-help">
      Number of units available for sale
    </p>
  </div>
</div>


        
        <div className="sub file">
          <div className="imgContainer">
            {images.map((image, index) => (
              <div className="imageUploader" key={index}>
                <input
                  type="file"
                  id={`imageUpload${index}`}
                  accept="image/*"
                  onChange={(e) => handleImage(e, index)}
                  style={{ display: "none" }}
                />

                <label htmlFor={`imageUpload${index}`} className="uploadIcon">
                  {image ? (
                    <img
                      src={
                        typeof image === "string"
                          ? `http://localhost:5000/${image}`
                          : URL.createObjectURL(image)
                      }
                      className="previewImage"
                      alt=""
                    />
                  ) : (
                    <span className="material-symbols-outlined">
                      add_photo_alternate
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>



        </div>
        <Button text="Submit" type="submit" />
        <Button text="delete" onClick={Delete} />
      </form>
    </div>
  );
}

export default ProductForm;
