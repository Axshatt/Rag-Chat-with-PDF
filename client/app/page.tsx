import ChatComponent from "./components/chat";
import FileUploadComp from "./components/fileUploadComp"

export default function Home() {
  return (
    <div>
      <div className="min-h-screen w-screen flex">
        <div className="min-w-[35vw]  p-[5vw] justify-center content-center items-center">
          <FileUploadComp></FileUploadComp>
        </div>
        <div className="min-w-[65vw]"></div>
        <ChatComponent/>

      </div>
    </div>
  );
}
