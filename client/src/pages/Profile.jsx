import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

export default function Profile() {
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({});
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);
  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      (error) => {
        setImageError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, profilePicture: downloadURL })
        );
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ffffff]">
      <div className="w-full max-w-lg p-6 bg-[#1a1a1a] rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center my-8 text-[#e6e6e6]">
          Profile
        </h1>
        <form className="flex flex-col gap-5">
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {/* 
      firebase storage rules:  
      allow read;
      allow write: if
      request.resource.size < 2 * 1024 * 1024 &&
      request.resource.contentType.matches('image/.*') */}
          <img
            src={formData.profilePicture || currentUser.profilePicture}
            alt="profile"
            className="h-28 w-28 self-center cursor-pointer rounded-full object-cover border-4 border-[#e94560]"
            onClick={() => fileRef.current.click()}
          />
          <p className="text-sm self-center">
            {imageError ? (
              <span className="text-red-700">
                Error uploading image (file size must be less than 3 MB)
              </span>
            ) : imagePercent > 0 && imagePercent < 100 ? (
              <span className="text-[#a1ff84aa]">{`Uploading: ${imagePercent} %`}</span>
            ) : imagePercent === 100 ? (
              <span className="text-green-400">
                Image uploaded successfully
              </span>
            ) : (
              ""
            )}
          </p>
          <input
            defaultValue={currentUser.username}
            type="text"
            id="username"
            placeholder="Username"
            className="bg-[#262626] rounded-lg p-4 text-[#e6e6e6] placeholder-[#888ea8] focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <input
            defaultValue={currentUser.email}
            type="email"
            id="email"
            placeholder="Email"
            className="bg-[#262626] rounded-lg p-4 text-[#e6e6e6] placeholder-[#888ea8] focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            className="bg-[#262626] rounded-lg p-4 text-[#e6e6e6] placeholder-[#888ea8] focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <button className="bg-[#e94560] text-[#ffffff] p-4 rounded-lg uppercase hover:bg-[#e94560] hover:opacity-90 disabled:opacity-70">
            Update
          </button>
        </form>
        <div className="flex justify-between mt-6">
          <span className="text-[#ff4d4d] cursor-pointer hover:underline">
            Delete Account
          </span>
          <span className="text-[#ff4d4d] cursor-pointer hover:underline">
            Sign out
          </span>
        </div>
      </div>
    </div>
  );
}
