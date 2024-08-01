"use client";

import { crowdedness, TrackType } from "@/app/lib/types";
import { msToHM } from "@/app/lib/trackHelper";
import React, { useEffect, useState } from "react";

const trackStyle = "py-6 my-4 rounded-2xl max-w-[600px] w-screen";
export function Track({ dayList, active, day, settings, isOdd }: TrackType) {
	var track: React.JSX.Element[] = [];

	const timeList = Object.keys(dayList).toSorted();
	for (let i = 0; i < timeList.length; i++) {

		const lsnStartTimex = timeList[i];
		const lsnStartTime = parseInt(lsnStartTimex);
		
		var subject = dayList[lsnStartTimex];
		subject = i == timeList.length - 1 ? "END" : subject || "";

		var HM = msToHM(lsnStartTime);

		let isFinished = i < (active || 0);
		let isActive = i == active;
		let isEND = subject == "END";

		var styles: string[] = [];
		var crowd = <></>;

		if (isFinished) styles.push("line-through");
		switch (subject) {
			case "Recess":
			case "Break": {
				styles.push("text-gray-500");
				crowd = (
					<Crowdedness
						subject={subject}
						day={day}
						isOdd={isOdd}
						time={lsnStartTime}
					/>
				);
				break;
			}

			case "{SciElec}":
				subject = settings.Elec.Sci || subject;

			default:
				break;
		}

		var liStyle = "flex marker:content-none border-grey ";
		if (isEND) liStyle += "items-center justify-center h-0 mt-6 mr-5 mb-2 ml-5 border-t";
		else liStyle += "justify-between items-center flex-wrap  p-2 mx-5 my-2  rounded-xl border ";

		const liDivStyle = `${styles.join(" ")} ${isEND ? "" : "max-w-52"}`;
		const li = (
			<li
				className={liStyle + (isActive ? "outline outline-1" : "")}
				key={typeof subject == "string" ? subject : subject[0]}>
				{isEND ? (
					<span className="text-grey px-1 py-[2px] bg-bg">END - {HM}</span>
				) : (
					<>
						<div className={liDivStyle}>
							{typeof subject == "string" ? subject : subject.join(" / ")}
						</div>
						<div className={styles.join(" ")}>{HM}</div>
						{crowd}
					</>
				)}
			</li>
		);
		track.push(li);
	}
	return (
		<ul
			id="track"
			className={trackStyle}>
			{track}
		</ul>
	);
}

function Crowdedness({ subject, day, isOdd, time }: any) {
	const [crowdedness, setCrowd] = useState<React.JSX.Element>(<>...</>);
	const path = "/api/getCommonSubj";
	const url = `${path}?subjectName=${subject}&week=${isOdd ? "Odd" : "Even"}`;
	useEffect(() => {
		fetch(url)
			.then((d) => d.json())
			.then((crowdness) => {
				const dayOfCrowd = crowdness[day as keyof crowdedness];
				if (dayOfCrowd == undefined) return setCrowd(<>xP</>);
				const classes = dayOfCrowd[time.toString()];
				const classes2 = dayOfCrowd[(time + 1200000).toString()];
				if (!classes || !classes2) return setCrowd(<>xP</>);

				const color = (classes: string[]) => {
					const percentage = (classes.length / 13) * 100;
					if (percentage <= 30) return "bg-green-600";
					if (percentage <= 60 && percentage >= 30) return "bg-yellow-500";
					if (percentage >= 60) return "bg-red-700";
				};
				function CrowdPill({ children, c }: { children: React.ReactNode; c: any }) {
					return (
						<div
							className={
								"text-nowrap text-left overflow-hidden overflow-ellipsis text-xs rounded-3xl h-full mx-1 px-3 " +
								color(c)
							}
							aria-label={c.join(", ")}>
							{children}
						</div>
					);
				}
				setCrowd(
					<>
						{subject == "Recess" ? (
							[classes, classes2].map((c) => {
								return <CrowdPill c={c}>{c.length} Classes</CrowdPill>;
							})
						) : (
							<CrowdPill c={classes}>
								{classes.length} Classes ({classes.join(", ")})
							</CrowdPill>
						)}
					</>
				);
			});
	}, []);
	return <div className="w-full h-5 flex items-center">Crowdedness {crowdedness}</div>;
}

export function TrackLoading() {
	return (
		<ul
			id="track"
			className={trackStyle}>
			{[1, 2, 3, 4, 5, 6].map((index) => (
				<li
					key={index}
					className="li-loading">
					<div className="px40"></div>
					<div className="px40"></div>
				</li>
			))}
		</ul>
	);
}
