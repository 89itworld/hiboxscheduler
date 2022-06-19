export default function Logo({ small }: { small?: boolean }) {
  return (
    <h1 className="inline brand-logo">
      <strong>
        <img
          className={small ? "mt-6 w-auto" : "h-5 w-auto"}
          alt="Hibox Scheduler"
          title="Hibox Scheduler"
          src="/Hibox-Scheduler-logo-white-word.svg"
        />
        {/*  <div className="mt-6 text-3xl font-bold text-center font-cal text-neutral-900">
          <h6>Hibox Scheduler</h6>
        </div> */}
      </strong>
    </h1>
  );
}
