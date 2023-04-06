import React from 'react';
import Experience from './Experience';

function ExperienceList({ experiences, onDelete }) {
    return (
        <div className='experience-table-holder'>
        <table>
            <thead>
                <tr>
                </tr>
            </thead>
            <tbody>
                {experiences.map((experience, i) => 
                    <Experience 
                        experience={experience} 
                        key={i}
                        onDelete={onDelete}
                    />)}
            </tbody>
        </table>
        </div>
    );
}

export default ExperienceList;