import {Auth} from "@supabase/auth-ui-react";
import {ThemeSupa} from "@supabase/auth-ui-shared";
import React, {useEffect, useState} from "react";
import {Button} from "../components/Button";
import {exportSubjectData, importSubjectData} from "../utils/storagehelper";
import {getSetting} from "../utils/settingsManager";

export default function Login({ supabase, cloudSyncManager }) {

    //Yes its copy pasted from index. No i cant be bothered.
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [cloudData, setCloudData] = useState(null)
    const [cloudLastUpdated, setCloudLastUpdated] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            supabase.auth.getUser().then(({data: user}) => {
                setUser(user.user)
            })

            supabase
                .from('userData')
                .select('*')
                .single().then(({data, error}) => {
                    if (error) {
                        console.error(error)
                        return
                    }

                    if (data) {
                        setCloudData(JSON.parse(data.userdata))
                        setCloudLastUpdated(data.lastUpdated)
                    }

                })
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = () => {
        supabase.auth.signOut()
    }

    const handleSaveDataToCloud = async () => {
        await supabase
            .from('userData')
            .upsert({userdata: exportSubjectData(), email: user.email, lastUpdated: new Date().toISOString()})
        alert("Done")
        setCloudLastUpdated(new Date().toISOString())
    }

    const handleImportDataFromCloud = async () => {
        const {data, error} = await supabase
            .from('userData')
            .select('userdata')
            .single()
        console.log(data)

        if (error) {
            console.error(error)
            return
        }

        if (data) {
            importSubjectData(JSON.parse(data.userdata))
            alert("Done")
        }
    }

    const legal = (<div className={"content-content"}
        style={{marginTop: "10px"}}
    >
        <h2>Something something Legal</h2>
        <b>Are you gonna give my data away?</b> If law enforcement asks for it.<br></br>
        <b>What if I want a copy of my data/delete my data/update my data?</b> Ask me. 2603003199a@gmail.com<br></br>
        <b>Can I store illegal stuff, virus or anything I shouldn't distribute online?</b> Not sure how you'd do that, but no.<br></br>
        <b>Can I store excessive amounts of data/use this other than intended?</b> No.<br></br>
        <b>What if my data gets lost?</b> While I try to keep your data safe, I unfortunately can't guarantee it. I'm not responsible for any data loss.<br></br>
        <b>What if my data gets leaked?</b> In the unlikely event it happens I will try to notify you. Maybe don't write your passwords as your assessment name.<br></br>
        <b>What if I don't agree to all of this?</b> Don't use the service.<br></br>
    </div>)

    if (session) {
        const autoSyncEnabled = getSetting('cloud.enableautosync');
        
        return <div>
            <div className={"content-header"}>
                <h1>Cloud Data Management</h1>
                Data storage is provided by <a className={"link"} href={"https://supabase.com"}>Supabase</a>,
                subject to their terms of service and privacy policy.
                <div style={{color: "var(--foreground-secondary)"}}>Yes, the url says /login. I couldn't be bothered to
                    fix it.</div>
            </div>
            <div className={"content-content"}>
                You are now logged in as {user?.email}. {" "}
                <span
                    style={{color: "var(--foreground-secondary)"}}>Last logged in at {new Date(user?.last_sign_in_at).toLocaleString()}.</span>

                <Button onClick={handleLogout}>Log out</Button>

                <div className="card" style={{ padding: '16px', margin: '16px 0', backgroundColor: autoSyncEnabled ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)' }}>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--foreground-primary)' }}>
                        {autoSyncEnabled 
                            ? '✅ Auto-sync is enabled. You no longer have to bother using the manual upload/download buttons.'
                            : '⚠️ Auto-sync is disabled. Enable it in Settings to sync automatically.'
                        }
                    </p>
                    {autoSyncEnabled && (
                        <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>Changes sync automatically when you make them</li>
                                <li>Smart conflict resolution prevents data loss</li>
                                <li>I vibe coded this entire feature so I dont know if conflict resolution actually works</li>
                            </ul>
                        </div>
                    )}
                    {!autoSyncEnabled && (
                        <p style={{ margin: '0', fontSize: '14px', color: 'var(--foreground-secondary)' }}>
                            You can still use manual upload/download below, or enable auto-sync in Settings for seamless experience.
                        </p>
                    )}
                </div>

                <h2>Manual Sync</h2>
                Read/write data manually. Any existing data will be overwritten.
                <div className={"card"} style={{
                    background: 'repeating-linear-gradient(45deg, #000, #000 5px, rgb(144,0,0) 5px, rgb(144,0,0) 10px)'
                }}>
                    <b>⚠️ Scary scare zone</b><br></br>
                    <Button onClick={() => {handleSaveDataToCloud()}}>Force Upload to Cloud</Button>
                    <Button onClick={() => {handleImportDataFromCloud()}}>Force Download from Cloud</Button>
                </div>
                {cloudLastUpdated && <div>Last manual update: {new Date(cloudLastUpdated).toLocaleString()}</div>}

                <h2>Current Data in the Cloud</h2>
                You have {cloudData?.length} subjects in the cloud. <br></br>
                {cloudData?.map((subject, index) => {
                    return <div key={index}>{subject.name} - {subject.assessments?.length} assessments</div>
                }) }
            </div>
            {legal}
        </div>
    } else {
        return <div>
            <div className={"content-header"}>
                <h1>Login</h1>
                Data storage is provided by <a className={"link"} href={"https://supabase.com"}>Supabase</a>,
                subject to their terms of service and privacy policy.
            </div>
            <div className={"content-content"}>
                <div className={"card background"}>
                    <b>Supabase Login</b>
                    <Auth supabaseClient={supabase} appearance={{theme: ThemeSupa}} theme={"dark"} providers={[]}/>
                </div>
            </div>
            {legal}
        </div>
    }
}