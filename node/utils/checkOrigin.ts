interface CheckOriginProps {
    headerOrigin: string | string[];
}

function checkOrigin({ headerOrigin }: CheckOriginProps) {
   return headerOrigin === "same-origin"
}

export { checkOrigin };
