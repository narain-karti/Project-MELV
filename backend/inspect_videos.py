import cv2
import os

def main():
    video_paths = [
        ("CAM-01 Upstream", "frontend/public/videos/cam_01_upstream.mp4"),
        ("CAM-02 Downstream", "frontend/public/videos/cam_02_downstream.mp4")
    ]

    for name, path in video_paths:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
        cap = cv2.VideoCapture(path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        print(f"=== {name} ({path}) ===")
        print(f"Resolution: {width}x{height}, FPS: {fps:.2f}, Frames: {total_frames}, Duration: {duration:.2f}s")
        
        # Extract 3 sample frames: 25%, 50%, 75%
        for pct in [0.25, 0.50, 0.75]:
            frame_idx = int(total_frames * pct)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if ret:
                out_img = f"backend/frame_{name.replace(' ', '_')}_{int(pct*100)}.jpg"
                cv2.imwrite(out_img, frame)
                print(f"Saved sample frame at {pct*100:.0f}% -> {out_img}")
        cap.release()

if __name__ == "__main__":
    main()

