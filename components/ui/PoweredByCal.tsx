import Link from "next/link";

import { useLocale } from "@lib/hooks/useLocale";

const PoweredByCal = () => {
  const { t } = useLocale();
  return (
    <div className="p-1 text-xs text-center sm:text-right">
      <Link href={`https://www.hibox.co/`}>
        <a target="_blank" className="text-gray-500 opacity-50 dark:text-white hover:opacity-100">
          {t("powered_by")}{" "}
          <img
            className="dark:hidden w-auto inline h-[10px] relative -mt-px"
            src="/hiboxCal.png"
            alt="Hibox"
            style={{ height: "25px" }}
          />
          <img
            className="hidden dark:inline w-auto h-[10px] relativ -mt-px"
            src="/hiboxCal.png"
            alt="Hibox"
            style={{ height: "25px" }}
          />
        </a>
      </Link>
    </div>
  );
};

export default PoweredByCal;
