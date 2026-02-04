/* eslint-disable global-require */

import React from 'react';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';


export const Lessons = [
    {
        title: "Sistemski pozivi",
        description: "",
        url: "/sistemski-pozivi/",
        posted: true,
    },
    {
        title: "Procesi",
        description: "",
        url: "/procesi/",
        posted: true,
    },
    {
        title: "Dretve",
        description: "",
        url: "/dretve/",
        posted: true,
    },
    {
        title: "Međuprocesna komunikacija",
        description: "",
        url: "/meduprocesna-komunikacija/",
        posted: true,
    },
    {
        title: "Upravljanje memorijom",
        description: "",
        url: "/upravljanje-memorijom/",
        posted: true,
    },
];

function TextCard({title, description, url, posted}) {
    return (
        <div className="col col--6 margin-bottom--lg">
            <div className="card pagination-nav__link padding-vert--xs">
                <div className="card__body">
                    <Heading as="h3">{title}</Heading>
                    <p>{description}</p>
                </div>
                <div className="card__footer">
                    <div className="text--center">
                        <Link className="button button--secondary white-space--normal" to={url} disabled={!posted}>
                            <b>Pogledaj vježbe</b>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TextCardsRow({array}) {
    return (
        <div className="row">
            {array.map((item) => (
                <TextCard key={item.name} {...item} />
            ))}
        </div>
    );
}
