import * as React from "react";

const AvatarContext = React.createContext<{
  imageLoadingStatus: "idle" | "loading" | "loaded" | "error";
  onImageLoadingStatusChange: (status: "idle" | "loading" | "loaded" | "error") => void;
}>({
  imageLoadingStatus: "idle",
  onImageLoadingStatusChange: () => {},
});

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", ...props }, ref) => {
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");

    return (
      <AvatarContext.Provider
        value={{ imageLoadingStatus, onImageLoadingStatusChange: setImageLoadingStatus }}
      >
        <div
          ref={ref}
          className={`relative flex size-8 shrink-0 overflow-hidden rounded-full ${className}`}
          {...props}
        />
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className = "", src, ...props }, ref) => {
    const { imageLoadingStatus, onImageLoadingStatusChange } =
      React.useContext(AvatarContext);

    React.useLayoutEffect(() => {
      if (src) {
        onImageLoadingStatusChange("loading");
      } else {
        onImageLoadingStatusChange("error");
      }
    }, [src, onImageLoadingStatusChange]);

    if (!src) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        className={`aspect-square size-full object-cover ${className} ${
          imageLoadingStatus === "loaded" ? "block" : "hidden"
        }`}
        onLoad={() => onImageLoadingStatusChange("loaded")}
        onError={() => onImageLoadingStatusChange("error")}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className = "", delayMs, ...props }, ref) => {
    const { imageLoadingStatus } = React.useContext(AvatarContext);
    const [canRender, setCanRender] = React.useState(delayMs === undefined);

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = setTimeout(() => setCanRender(true), delayMs);
        return () => clearTimeout(timerId);
      }
    }, [delayMs]);

    if (!canRender) {
      return null;
    }

    if (imageLoadingStatus === "loaded") {
      return null;
    }

    return (
      <div
        ref={ref}
        className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-900 ${className}`}
        {...props}
      />
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, className = "", limit, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const excess =
      limit && childrenArray.length > limit ? childrenArray.length - limit : 0;
    const itemsToShow = limit ? childrenArray.slice(0, limit) : childrenArray;

    return (
      <div
        ref={ref}
        className={`flex items-center -space-x-5 ${className}`}
        {...props}
      >
        {itemsToShow.map((child) => {
          if (!React.isValidElement(child)) return null;
          return React.cloneElement(
            child as React.ReactElement<{ className?: string }>,
            {
              className: `${
                (child as React.ReactElement<{ className?: string }>).props
                  .className || ""
              }`.trim(),
            }
          );
        })}
        {excess > 0 && (
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-900">
            +{excess}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
