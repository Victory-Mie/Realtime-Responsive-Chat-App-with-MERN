import { Camera } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [newImg, setNewImg] = useState(null);
  const handleUploadImg = async (e) => {
    const img = e.target.files[0]; // 从事件对象 e 中获取上传的文件。e.target.files 是一个文件列表。
    if (!img) return;
    const reader = new FileReader(); // 实例化一个 FileReader 对象，用于异步读取文件内容。
    reader.readAsDataURL(img); // 将文件读取为 Data URL（base64 编码的字符串），适合用于图像预览。
    reader.onload = async () => {
      const base64Img = reader.result; // 获取读取的结果，这里是一个 base64 编码的图像字符串。
      setNewImg(base64Img); //更新图像预览
      await updateProfile({ profilePic: base64Img });
    }; // 当文件读取完成后触发
  };

  return (
    <div className="min-h-screen pt-20 ">
      <div className="bg-base-300 rounded-xl max-w-xl mx-auto p-6 my-4">
        <div className=" flex justify-center items-center text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold">个人中心</div>
            <div className="relative">
              <img
                src={newImg || authUser.profilePic || "/avatar.png"}
                className="size-32 rounded-full object-cover border-4 "
              ></img>
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="text-base-200 size-6"></Camera>
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  disabled={isUpdatingProfile}
                  onChange={handleUploadImg}
                ></input>
              </label>
            </div>
            <div className="text-sm">
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to update your photo"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 my-6 ">
          <div>
            <div className="text-sm mb-2"> Full Name</div>

            <label className="input input-bordered flex items-center gap-2 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input
                readOnly
                type="text"
                className="grow"
                placeholder={authUser.fullName}
              />
            </label>
          </div>
          <div>
            <div className="text-sm  mb-2"> Email Address</div>
            <label className="input input-bordered flex items-center gap-2 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input
                readOnly
                type="text"
                className="grow"
                placeholder={authUser.email}
              />
            </label>
          </div>
        </div>
      </div>
      {/* <div className="bg-base-300 rounded-xl max-w-xl mx-auto p-6 ">
        <div>
          <div className="mb-5 text-lg font-bold">Account Information</div>
          <div className=" flex flex-col gap-4">
            <div>Member Since</div>
            <div>Account Status</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProfilePage;
